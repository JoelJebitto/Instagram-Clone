import "./App.css";
import Post from "./Post";
import react, { useEffect, useState } from "react";
import { auth, db, storage } from "./firebase";
import { Button, makeStyles, Modal, Input } from "@material-ui/core";
import LinearProgress from "@material-ui/core/LinearProgress";
import firebase from "firebase";

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: "absolute",
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

function App() {
  const classes = useStyles();
  const [modalStyle] = react.useState(getModalStyle);
  const [posts, setPosts] = useState([]);
  const [openSignUp, setOpenSignUp] = useState(false);
  const [openSignIn, setOpenSignIn] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [createPost, setCreatePost] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        console.log(authUser);
        setUser(authUser);
      } else {
        setUser(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user, username]);

  useEffect(() => {
    db.collection("posts")
      .orderBy("timestamp", "desc")
      .onSnapshot((snapshot) => {
        setPosts(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            post: doc.data(),
          }))
        );
      });
  }, []);

  const signUp = (event) => {
    event.preventDefault();

    auth
      .createUserWithEmailAndPassword(email, password)
      .then((authUser) => {
        return authUser.user.updateProfile({
          displayName: username,
        });
      })
      .catch((err) => {
        alert(err.message);
        setOpenSignUp(true);
      });

    setOpenSignUp(false);
  };

  const signIn = (event) => {
    event.preventDefault();
    auth.signInWithEmailAndPassword(email, password).catch((err) => {
      alert(err.message);
      setOpenSignIn(true);
    });
    setOpenSignIn(false);
  };

  const signInModal = () => {
    return (
      <Modal open={openSignIn} onClose={() => setOpenSignIn(false)}>
        <div style={modalStyle} className={classes.paper}>
          <div>
            <form className="app__signUp">
              <center>
                <img
                  src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
                  alt=""
                  className="app__headerImage"
                />
              </center>
              <center>
                <Input
                  placeholder="Email"
                  type="text"
                  value={email}
                  className="app__signUp__Input"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </center>

              <center>
                <Input
                  placeholder="Password"
                  type="password"
                  value={password}
                  className="app__signUp__Input"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </center>
              <div>
                <div />
                <div />
                <div>
                  <Button type="submit" onClick={signIn}>
                    Sign In
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </Modal>
    );
  };

  const signUpModal = () => (
    <Modal open={openSignUp} onClose={() => setOpenSignUp(false)}>
      <div style={modalStyle} className={classes.paper}>
        <div>
          <form className="app__signUp">
            <center>
              <img
                src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
                alt=""
                className="app__headerImage"
              />
            </center>
            <center>
              <Input
                placeholder="Username"
                type="username"
                value={username}
                className="app__signUp__Input"
                onChange={(e) => setUsername(e.target.value)}
              />
            </center>
            <center>
              <Input
                placeholder="Email"
                type="text"
                value={email}
                className="app__signUp__Input"
                onChange={(e) => setEmail(e.target.value)}
              />
            </center>

            <center>
              <Input
                placeholder="Password"
                type="password"
                value={password}
                className="app__signUp__Input"
                onChange={(e) => setPassword(e.target.value)}
              />
            </center>
            <div>
              <div />
              <div />
              <div>
                <Button type="submit" onClick={signUp}>
                  Sign Up
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );

  const ID = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  const PostModal = () => {
    const [image, setImage] = useState(null);
    const [progress, setProgress] = useState(0);
    const [caption, setCaption] = useState("");
    const fileSelected = (e) => {
      if (e.target.files[0]) {
        setImage(e.target.files[0]);
      }
    };

    const onUpload = () => {
      const uploadTask = storage
        .ref(`images/${image.name}.png`) //${ID()}
        .put(image);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          setProgress(
            Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
          );
        },
        (error) => {
          console.log(error);
          alert(error.message);
        },
        () => {
          storage
            .ref("images")
            .child(`${image.name}.png`)
            .getDownloadURL()
            .then((url) => {
              db.collection("posts").add({
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                caption: caption,
                imageUrl: url,
                username: user.displayName,
              });
              setCreatePost(false);
              setProgress(0);
              setCaption("");
              setImage(null);
            });
        }
      );
    };
    return (
      <Modal open={createPost} onClose={() => setCreatePost(false)}>
        <div style={modalStyle} className={classes.paper}>
          <div className="createPost__container">
            {/* <progress /> */}
            <LinearProgress variant="determinate" value={progress.valueOf()} />
            <Input
              placeholder="Enter A Caption"
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              type="text"
            />
            <Input
              type="file"
              className="createPost__fileSelect"
              onChange={fileSelected}
            />
            <Button onClick={onUpload}>Post</Button>
          </div>
        </div>
      </Modal>
    );
  };

  const appHeader = () => (
    <div className="app__header">
      <div className="app__header__left">
        <img
          src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
          alt=""
          className="app__headerImage"
        />
        <div className="app__by">
          <h1>By</h1>
          <h1 className="app__by__text">Joel</h1>
          <h1 className="app__by__text">Jebitto</h1>
        </div>
      </div>
      {user ? (
        <div className="app__loginContainer">
          <Button onClick={() => auth.signOut()}>Logout</Button>
        </div>
      ) : (
        <div className="app__loginContainer">
          <Button onClick={() => setOpenSignIn(true)}>Sign In</Button>
          <Button onClick={() => setOpenSignUp(true)}>Sign Up</Button>
        </div>
      )}
    </div>
  );

  const appPostList = () => (
    <div className="app__posts">
      {posts.map(({ id, post }) => (
        <Post
          key={id}
          username={post.username}
          caption={post.caption}
          imageUrl={post.imageUrl}
        />
      ))}
    </div>
  );

  const appAddPost = () => (
    <div className="app__createPost">
      <div></div>
      <div>
        <div onClick={() => setCreatePost(true)} className="circle">
          <h1>+</h1>
        </div>
      </div>
    </div>
  );
  return (
    <div className="app">
      {signUpModal()}
      {PostModal()}
      {signInModal()}
      {appHeader()}
      {appPostList()}
      <div className="app__footer">
        {user?.displayName ? appAddPost() : <h3>Not Logged In</h3>}
      </div>
    </div>
  );
}

export default App;
