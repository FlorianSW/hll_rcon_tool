import axios from 'axios';

export default function createClient() {
    const client = axios.create();

    client.defaults.validateStatus = (status: number) => {
        return status >= 200 && status < 500;
    };

    return client;
}