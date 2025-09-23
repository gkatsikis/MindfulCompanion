const BASE_URL = 'http://localhost:8001';

interface TestResponse {
    message: string;
    status: string;
}

export const testConnection = async (): Promise<TestResponse> => {
    try {
        const response = await fetch(`${BASE_URL}/api/test/`);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const data: TestResponse = await response.json();
        return data
    } catch (error) {
        console.error('Error testing connection:', error);
        throw error;
    }
    // const response = {
    //     'message': 'the service is getting hit at least',
    //     'status': 'Success'
    // }

    // return response
};