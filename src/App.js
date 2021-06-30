import "./App.css";
import Post from "./Post";
import react, { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { Button, makeStyles, Modal, Input } from "@material-ui/core";
import CreatePost from "./CreatePost";

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
    db.collection("posts").onSnapshot((snapshot) => {
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

  return (
    <div className="app">
      <CreatePost />
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

      <div className="app__header">
        <img
          src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
          alt=""
          className="app__headerImage"
        />
        <h1 className="app__by">By Joel Jebitto</h1>
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
    </div>
  );
}

export default App;
