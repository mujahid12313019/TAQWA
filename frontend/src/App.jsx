import "./App.css";
import { BrowserRouter as Router, Route, Routes} from "react-router-dom";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// Correct import:
// Should be:
import { faCopyright, faRetweet } from '@fortawesome/free-solid-svg-icons';
function App() {
const [blogs, setBlogs] = useState([]);

useEffect(() => {
  fetch("https://tawqabackend.onrender.com/get")
    .then((res) => res.json())
    .then((data) => {
      console.log("Fetched blogs:", data);
      setBlogs(data);
    })
    .catch((error) => console.error("Error fetching blogs:", error));
}, []);

  return (
    <Router>
      
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route
          path="/blog"
          element={<Blog blog={blogs} setBlog={setBlogs}/>
            }
        />
        <Route path="/posts/:id" element={<SinglePost />} />
        <Route path="/signup" element={<SignUp/>}/>
        <Route path="/login" element={<Login/>}/>
      </Routes>
    </Router>
  );
}
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
 
function Blog({blog,setBlog}){
 
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
 
  const [updateindex, setUpdateindex] = useState(null);
  const [updatedBlog, setUpdatedBlog] = useState(null);
 
    useEffect(() => {
    const token=localStorage.getItem('token')
    if(!token) return  window.location.href = "/login";

    fetch("https://tawqabackend.onrender.com/blog", { 
      method: "GET",
      headers:{
        Authorization:`Bearer ${token}`
      } ,
    })
      .then((res) => {
        if (res.status !== 200) {
           localStorage.removeItem('token')
           localStorage.removeItem('username')
        }
      
      })
      .catch((err) =>{
        console.error("Auth check failed:", err)
        localStorage.removeItem('token')
        localStorage.removeItem('username')
      } )
  }, []);
  return(
    <div className="blog-list">
      <p>Welcome back,{localStorage.getItem('username')}</p>
              <input
                type="text"
                placeholder="Title"
                onChange={(e) => setTitle(e.target.value)}
              />
              <input
                type="text"
                placeholder="Content"
                onChange={(e) => setContent(e.target.value)}
              />
              
              <button onClick={()=>{
                localStorage.removeItem("token")
                localStorage.removeItem('username')
                window.location.href='/login'
              }}>Logout</button>
              <button
                onClick={async () => {
                  const response = await fetch("/add", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      title: title,
                      content: content,
                      author: localStorage.getItem('username'),
                    }),
                  });

                  if (response.ok) {
                    const updatedBlogs = await fetch(
                      "https://tawqabackend.onrender.com/get"
                    ).then((res) => res.json());
                    setBlog(updatedBlogs);
                  }
                }}
              >
                Send Data
              </button>
              {blog.map((item, index) => {
                return (
                  <div key={index}>
                    {updateindex === index ? (
                      <div>
                        <input
                          type="text"
                          placeholder="Title"
                          value={updatedBlog?.title || item.title}
                          onChange={(e) =>
                            setUpdatedBlog({ ...item, title: e.target.value })
                          }
                        />
                        <input
                          type="text"
                          placeholder="Content"
                          value={updatedBlog?.content || item.content}
                          onChange={(e) =>
                            setUpdatedBlog({ ...item, content: e.target.value })
                          }
                        />
                        
                        <button
                          onClick={async () => {
                            const response = await fetch(
                              `https://tawqabackend.onrender.com/edit/${item._id}`,
                              {
                                method: "PUT",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify(updatedBlog),
                              }
                            );
                            if (response.ok) {
                              const updatedBlogs = await fetch(
                                "https://tawqabackend.onrender.com/get"
                              ).then((res) => res.json());
                              setBlog(updatedBlogs);
                              setUpdateindex(null);
                            }
                          }}
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div>
                        <h1>Title: {item.title}</h1>
                        <p>Content: {item.content.slice(0, 100)}...</p>
                        <Link to={`/posts/${item._id}`}>Read More</Link>
                        <p>Author: {item.author}</p>
                        <p>Date: {new Date(item.date).toLocaleString()}</p>
                        {localStorage.getItem('username')==item.author?(
                          <div>
                         <button
                          onClick={async () => {
                            const response = await fetch(
                              `https://tawqabackend.onrender.com/delete/${item._id}`,
                              {
                                method: "DELETE",
                              }
                            );
                            if (response.ok) {
                              const updatedBlogs = await fetch(
                                "https://tawqabackend.onrender.com/get"
                              ).then((res) => res.json());
                              setBlog(updatedBlogs);
                            }
                          }}
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => {
                            setUpdateindex(index);
                            setUpdatedBlog(item);
                          }}
                        >
                          Edit
                        </button>
                        </div>
                        ):(
                         <p></p>
                        )}
                        
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          
  )
}
function SinglePost() {
  const [post, setPost] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    fetch(`https://tawqabackend.onrender.com/get/${id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched post:", data); // Debugging
        setPost(data);
      })
      .catch((error) => console.error("Error fetching post:", error));
  }, [id]);

  if (!post) return <div>Loading...</div>;

  return (
    <div>
      <h1>Title: {post.title}</h1>
      <p>Content: {post.content}</p>
      <p>Author: {post.author}</p>
      <p>Date: {new Date(post.date).toLocaleString()}</p>
    </div>
  );
}
function Home(){
  return(
    <div className="homepage">
<h1 id="Header">Welcome to Daily Islam</h1><br/>
<Link to='/login'>Login</Link><br/>
Don't Have a account?<br/>
<Link to='/signup'>Sign Up</Link><br/>
 <img src="../copyright-solid.svg" height={20}/>
 By Mujahid Hossen Sagar
 <br/>
 
    </div>
    
  )
}
function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const token=localStorage.getItem('token')
    if(!token) return;
    fetch("https://tawqabackend.onrender.com/blog", { 
      method: "GET",
      headers:{
        Authorization:`Bearer ${token}`
      } ,
    })
      .then((res) => {
        if (res.status === 200) {
          window.location.href = "/blog";
        }
        else {
          localStorage.removeItem('token')
        }
      })
      .catch((err) =>{
        console.error("Auth check failed:", err)
        localStorage.removeItem('token')
      } )
  }, []);

  return (
    <div className="loginpage">
      
      Username: <input type="text" onChange={(e) => setUsername(e.target.value)} /><br />
      Password: <input type="password" onChange={(e) => setPassword(e.target.value)} /><br />
      <button
        onClick={async () => {
          const res = await fetch("https://tawqabackend.onrender.com/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
              username:username, 
              password:password 
            }),
          });
         const data=await res.json()
         
          if (res.status === 201) {
            localStorage.setItem('token',data.token)
            localStorage.setItem('username',username)
            window.location.href = "/blog";
            alert('Login successful')
          } else {
            alert("Login failed. Please try again.");
          }
        }}
      >
        Login
      </button>
      <br />
     
    </div>
  );
}

function SignUp(){
   const [username,setUsername]=useState("")
  const [password,setPassword]=useState("")
  const [error,setError]=useState("")
  return(
    <div className="signup">
      Username:
      <input type="text" placeholder="Username" onChange={(e)=>setUsername(e.target.value)}/><br/>
      Password:<input type="password" placeholder="Password" onChange={(e)=>setPassword(e.target.value)}/><br/>
      <button onClick={async ()=>{
        const res=  await fetch("https://tawqabackend.onrender.com/signup", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                     username:username,
                     password:password
                    }),
                  });
                if(res.status==201){
                  window.location.href='/login'
                  
                }
                else if(res.status===404){
                  const data=await res.json()
                  setError(data.error)
                }

      }
      
     
      }>Sign Up</button>
      <p>{error}</p>
    </div>
  )
}
export default App;
