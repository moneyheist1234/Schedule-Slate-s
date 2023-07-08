const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

url = 'mongodb://0.0.0.0/todo'
mongoose.connect(url);




const itemsSchema = mongoose.Schema({
  name: String
});

const Item = mongoose.model('item', itemsSchema);

const item1 = new Item(
  {
      name: "To add New Task, use Add Task Button"
  }
);

const item2 = new Item({
  name: "Double Click the checkbox to delete the task"
});

const item3 = new Item(
  {
      name: "Homework"
  }
);

const defaultTasks = [item1, item2, item3];

const userSchema = mongoose.Schema(
  {
    Name: String,
    Email : String,
    Password: String,
    Tasks : [itemsSchema]
  }
);


const User = mongoose.model('user',userSchema);


app.use(bodyParser.json());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));


app.set("view engine", "ejs");
app.set("views", "views");

app.get("/register", (req, res) => {
  res.render('register');

})

app.post("/register", (req, res) => {
  const par_name = req.body.name;
  const par_email = req.body.email;
  const par_password = req.body.password;

  const user = new User({
    Name: par_name,
    Email: par_email,
    Password: par_password,
    Tasks: defaultTasks
  });
  user.save();
  res.redirect('/');
});

app.get("/loginpage", (req, res) => {
  res.render("loginpage");
});

app.get("/",(req,res)=>{
  res.render("loginpage");
})

app.post("/login",(req, res) => {
  
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({Email: email,Password: password},(err,foundList)=>{
      
      if(!err){
        if (foundList) {
          res.render('index', { name: foundList.Name, tasks: foundList.Tasks });
        } else {
          // Handle the case where no user was found with the provided name
          res.send('User not found');
        }
      }
      else
      {res.send(err);
      }  
    });
    
});


app.post('/addTask', (req, res) => {
  const newTaskStrng = req.body.task;
  const name = req.body.name;
  const newTask = new Item({
    name: newTaskStrng
  }
  );



      User.findOne({ Name: name }, (err, foundList) => {
          if (!err) {
              foundList.Tasks.push(newTask);
              foundList.save();
              res.render('index',{name: foundList.Name,tasks : foundList.Tasks});
          }
          else {
              console.log(err);
          }
      });
});


app.post('/checked', (req, res) => {
  const deleteId = req.body.chck;
  const name = req.body.name;


  User.findOneAndUpdate({name:name},{$pull : {Tasks: {_id: deleteId}}},(err,foundList)=>{
    if(!err){
      res.render('index',{name: foundList.Name,tasks : foundList.Tasks});
    }
});

  
})


app.post("/logout",(req,res) => {
  res.redirect("/loginpage");
});








app.listen(5000, () => {
  console.log("App listening on port 5000");
});
