import { useRouter } from 'next/router';
import { BsArrowLeft } from 'react-icons/bs';
import classes from './BackButton.module.css';

export default function BackButton() {
    const router = useRouter();

    return (
        <button
            className={classes.backBtn}
            onClick={() => router.back()}
            aria-label="Go Back"
        >
            <BsArrowLeft />
        </button>
    );
}
