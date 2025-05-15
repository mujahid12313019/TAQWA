import "./App.css";
import { BrowserRouter as Router, Route, Routes} from "react-router-dom";
import { useParams } from "react-router-dom";

function App() {
const [blogs, setBlogs] = useState([]);

useEffect(() => {
  fetch("http://localhost:3000/get")
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
  const [author, setAuthor] = useState("");
  const [updateindex, setUpdateindex] = useState(null);
  const [updatedBlog, setUpdatedBlog] = useState(null);
 
    useEffect(() => {
    const token=localStorage.getItem('token')
    if(!token) return  window.location.href = "/login";

    fetch("http://localhost:3000/blog", { 
      method: "GET",
      headers:{
        Authorization:`Bearer ${token}`
      } ,
    })
      .then((res) => {
        if (res.status !== 200) {
           localStorage.removeItem('token')
        }
      
      })
      .catch((err) =>{
        console.error("Auth check failed:", err)
        localStorage.removeItem('token')
      } )
  }, []);
  return(
    <div>
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
              <input
                type="text"
                placeholder="Author"
                onChange={(e) => setAuthor(e.target.value)}
              />
              <button onClick={()=>{
                localStorage.removeItem("token")
                window.location.href='/login'
              }}>Logout</button>
              <button
                onClick={async () => {
                  const response = await fetch("http://localhost:3000/add", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      title: title,
                      content: content,
                      author: author,
                    }),
                  });

                  if (response.ok) {
                    const updatedBlogs = await fetch(
                      "http://localhost:3000/get"
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
                        <input
                          type="text"
                          placeholder="Author"
                          value={updatedBlog?.author || item.author}
                          onChange={(e) =>
                            setUpdatedBlog({ ...item, author: e.target.value })
                          }
                        />
                        <button
                          onClick={async () => {
                            const response = await fetch(
                              `http://localhost:3000/edit/${item._id}`,
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
                                "http://localhost:3000/get"
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
                        <button
                          onClick={async () => {
                            const response = await fetch(
                              `http://localhost:3000/delete/${item._id}`,
                              {
                                method: "DELETE",
                              }
                            );
                            if (response.ok) {
                              const updatedBlogs = await fetch(
                                "http://localhost:3000/get"
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
    fetch(`http://localhost:3000/get/${id}`)
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
    <div>
<h1>Welcome to Daily Islam</h1><br/>
<Link to='/login'>Login</Link><br/>
Don't Have a account?<br/>
<Link to='/signup'>Sign Up</Link>
    </div>
    
  )
}
function Login() {
  const [username, setUsername] = useState("akhi");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const token=localStorage.getItem('token')
    if(!token) return;
    fetch("http://localhost:3000/blog", { 
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
    <div>
      
      Username: <input type="text" onChange={(e) => setUsername(e.target.value)} /><br />
      Password: <input type="password" onChange={(e) => setPassword(e.target.value)} /><br />
      <button
        onClick={async () => {
          const res = await fetch("http://localhost:3000/login", {
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

  return(
    <div>
      Username:
      <input type="text" placeholder="Username" onChange={(e)=>setUsername(e.target.value)}/><br/>
      Password:<input type="password" placeholder="Password" onChange={(e)=>setPassword(e.target.value)}/><br/>
      <button onClick={async ()=>{
        const res=  await fetch("http://localhost:3000/signup", {
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

      }
      
     
      }>Sign Up</button>
    </div>
  )
}
export default App;