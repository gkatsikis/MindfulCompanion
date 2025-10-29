from rest_framework import serializers
from .models import JournalEntry, AIInteraction


class AIInteractionSerializer(serializers.ModelSerializer):
    """
    Serializer for AI interaction responses.
    This converts the AIInteraction model to JSON format.
    """
    class Meta:
        model = AIInteraction
        fields = [
            'id',
            'claude_response',
            'context_entries_count',
            'tokens_used',
            'api_cost',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class JournalEntrySerializer(serializers.ModelSerializer):
    """
    Serializer for journal entries.
    Handles conversion between JournalEntry model and JSON.
    Automatically validates incoming data against model constraints.
    """
    # Include the AI interaction data when reading (optional, may not exist yet)
    ai_interaction = AIInteractionSerializer(read_only=True, required=False)

    # Add a field to show how many context entries this entry will use
    context_window_size = serializers.SerializerMethodField()

    class Meta:
        model = JournalEntry
        fields = [
            'id',
            'title',
            'content',
            'requested_help_type',
            'is_continuation',
            'references_past_entries',
            'created_at',
            'context_window_size',
            'ai_interaction'
        ]
        read_only_fields = ['id', 'created_at']

    def get_context_window_size(self, obj):
        """
        Custom method to include the calculated context window size.
        The 'obj' parameter is the JournalEntry instance being serialized.
        """
        return obj.get_context_window_size()

    def validate_content(self, value):
        """
        Custom validation for content field.
        Ensures content is not empty or just whitespace.
        """
        if not value or not value.strip():
            raise serializers.ValidationError(
                "Journal entry content cannot be empty.")
        return value.strip()


class JournalEntryListSerializer(serializers.ModelSerializer):
    """
    Lighter serializer for listing multiple entries.
    Excludes AI interaction and full content to reduce response size.
    Use this for the journal entry list/history view.
    """
    # Show a preview of the content (first 150 characters)
    content_preview = serializers.SerializerMethodField()

    class Meta:
        model = JournalEntry
        fields = [
            'id',
            'title',
            'content_preview',
            'requested_help_type',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def get_content_preview(self, obj):
        """
        Returns first 150 characters of content with ellipsis if truncated.
        """
        if len(obj.content) > 150:
            return obj.content[:150] + '...'
        return obj.content
