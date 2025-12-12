import PostItem from './PostItem';
import classes from './PostList.module.css';

function PostList(props) {
  return (
    <div className={classes.grid}>
      {props.posts.map((post) => (
        <PostItem
          key={post._id}
          id={post._id}
          image={post.image}
          title={post.title}
          address={post.address}
          username={post.username}
          profilePicture={post.profilePicture}
          likes={post.likes || []}
          comments={post.comments || []}
        />
      ))}
    </div>
  );
}

export default PostList;

