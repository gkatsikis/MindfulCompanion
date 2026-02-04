from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    """
    User model for authentication and sensitive data partition.
    To be used in conjunction with django-allauth.
    """

    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)

    date_joined = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email


class UserPreferences(models.Model):
    """
    User's personal information and preferences separate from auth
    """

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preferences')

    user_timezone = models.CharField(max_length=50, default='UTC')
    preferred_name = models.CharField(max_length=50, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class JournalEntry(models.Model):
    """
    Individual journal entries
    """

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='journal_entries')

    title = models.CharField(max_length=200, blank=True, null=True)
    content = models.TextField(help_text='the journal entry content')

    HELP_TYPE_CHOICES = [
        ('acute_validation', 'acute_validation'),
        ('acute_skills', 'acute_skills'),
        ('chronic_education', 'chronic_education'),
        ('chronic_validation', 'chronic_validation'),
        ('max_validation', 'max_validation'),
        ('max_assessment', 'max_assessment')
    ]

    requested_help_type = models.CharField(max_length=20, choices=HELP_TYPE_CHOICES, blank=True, null=True, help_text='What kind of support do you need today?')

    is_continuation = models.BooleanField(default=False, help_text='Is this continuing a theme from recent entries?')
    references_past_entries = models.BooleanField(default=False, help_text='Does this entry reference previous journal entries?')

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Journal Entries'

    def get_context_window_size(self):
        """
        Determine how many previous entries Claude should see based on help type
        Returns number of previous entries to include as context
        """
        
        if not self.requested_help_type:
            return 0

        context_rules = {
            'acute_validation': 0,
            'acute_skills': 0,
            'chronic_education': 7,
            'chronic_validation': 7,
            'max_assessment': 30,
            'max_validation': 30,
        }

        base_context = context_rules.get(self.requested_help_type, 0)

        return base_context

    def get_context_entries(self):

        context_size = self.get_context_window_size()

        if context_size == 0:
            return []

        return JournalEntry.objects.filter(user=self.user, created_at__lt=self.created_at).order_by('-created_at')[:context_size]


class AIInteraction(models.Model):
    """
    Records each interaction with Claude API - for analytics purpose
    """

    journal_entry = models.OneToOneField(JournalEntry, on_delete=models.CASCADE, related_name='ai_interaction')

    claude_response = models.TextField()
    context_entries_count = models.IntegerField(default=0)
    tokens_used = models.IntegerField(null=True, blank=True)
    api_cost = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Claude interaction for {self.journal_entry}"
