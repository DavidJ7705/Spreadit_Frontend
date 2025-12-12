// our-dimain.com/new-post
import NewPostForm from '../../components/posts/NewPostForm'

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import BackButton from '../../components/ui/BackButton';

function NewPostPage() {
    const router = useRouter();
    const [moduleId, setModuleId] = useState(null);

    useEffect(() => {
        if (router.isReady && router.query.moduleId) {
            setModuleId(router.query.moduleId);
        }
    }, [router.isReady, router.query.moduleId]);

    async function addPostHandler(enteredPostData) {
        try {
            // Get user_id from localStorage
            const userId = localStorage.getItem('userId');
            if (!userId) {
                alert('You must be logged in to create a post');
                router.push('/login');
                return;
            }

            const response = await fetch('/api/new-post', {
                method: 'POST',
                body: JSON.stringify({
                    ...enteredPostData,
                    user_id: userId
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                router.push('/');
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to create post');
            }
        } catch (err) {
            console.error('Error creating post:', err);
            alert('Failed to create post');
        }
    }

    return (
        <>
            <BackButton />
            <NewPostForm onAddPost={addPostHandler} preSelectedModuleId={moduleId} />
        </>
    );
}

export default NewPostPage