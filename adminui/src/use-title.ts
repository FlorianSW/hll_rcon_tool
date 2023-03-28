import {useEffect} from 'react'

function useTitle(title: string) {
    useEffect(() => {
        document.title = title + ' | Community RCon';
    }, [title]);

    useEffect(() => () => {
        document.title = 'Community RCon';
    }, []);
}

export default useTitle