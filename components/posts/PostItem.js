import classes from './PostItem.module.css';
import { useRouter } from 'next/router';
import { AiOutlineHeart, AiOutlineComment, AiOutlineDelete } from 'react-icons/ai';

function PostItem(props) {
  const router = useRouter();
  const hasImage = props.image && props.image.length > 0;
  const likeCount = props.likes?.length || 0;
  const commentCount = props.comments?.length || 0;

  const isOwner = props.currentUserId && props.authorId && props.currentUserId === props.authorId;

  return (
    <div className={classes.card} onClick={() => router.push("/" + props.id)}>
      <div className={classes.header}>
        {props.profilePicture ? (
          <img src={props.profilePicture} alt="" className={classes.profilePic} />
        ) : (
          <div className={classes.profilePicPlaceholder}>
            {props.username ? props.username[0].toUpperCase() : "U"}
          </div>
        )}
        <span className={classes.username}>{props.username}</span>

        {isOwner && (
          <div
            className={classes.deleteBtn}
            onClick={(e) => {
              e.stopPropagation();
              props.onDelete && props.onDelete(props.id);
            }}
            style={{ marginLeft: 'auto', cursor: 'pointer', color: '#ff4d4d' }}
            title="Delete Post"
          >
            <AiOutlineDelete size={20} />
          </div>
        )}
      </div>

      {hasImage && (
        <div className={classes.imageWrapper}>
          <img src={props.image} alt={props.title} />
        </div>
      )}

      <div className={`${classes.content} ${!hasImage ? classes.noImage : ''}`}>
        <h3>{props.title}</h3>
        {!hasImage && props.description && (
          <p className={classes.preview}>{props.description.slice(0, 100)}...</p>
        )}
      </div>

      {/* Engagement Stats */}
      <div className={classes.engagementRow}>
        <div className={classes.stat}>
          <AiOutlineHeart size={18} />
          <span>{likeCount}</span>
        </div>
        <div className={classes.stat}>
          <AiOutlineComment size={18} />
          <span>{commentCount}</span>
        </div>
      </div>
    </div>
  );
}

export default PostItem;
