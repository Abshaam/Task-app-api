// requiring all modules 
const {Todo} = require('../model/todo');
const {User}  = require('../model/user');

// controller for adding a todo
const addTodo = async (req, res) =>{
   try{ 

    const { userId } = req.params;
    const { todo } = req.body;

    const data ={
         todo
    }

    const newData = { ...data, user: userId }

    const dataStore = new Todo(newData)

    const saveData = await dataStore.save();

    const fetchUser = await User.findById(userId)

    fetchUser.todos.push(saveData)

    await fetchUser.save();

    res.status(201).json(fetchUser);
         }catch(error) {
             res.status(500).json(error)
          console.log(error.message)
}  

 };



const fetchTodos = async (req, res) =>{
    try{
    const todos = await Todo.find();
    res.status(200).json(todos);
    }catch (error) {
        console.log(error.message)
    }
}

const fetchATodo = async (req, res) =>{
    try{
    const {id} = req.params
    const todo = await Todo.findById(id);
    res.status(200).json(todo);
    }catch(error){
        console.log(error.message)
    }
}

const deleteTodo = async (req, res) =>{

    try{
    const {id} = req.params
    const todo = await Todo.findByIdAndDelete(id)

    res.status(200).json({msg: `${todo} deleted successfully`})
    }catch(error){
        console.log(error.message)
    }
}

const updateTodo = async (req, res) =>{
    try{
        const {status} = req.body

        const {id} = req.params

        const update = {status}

        const todo = await Todo.findOneAndUpdate({_id: id}, update, { new: true});

        res.status(200).json(todo);

        res.send(todo)
    }catch(error){
        console.log(error.message)
    }
}

const todoByUser = async (req, res) => {

    const { todoId } = req.params;

    const todo = await Todo.findById(todoId).populate('user');

    res.send(todo);
};

module.exports = {
    addTodo,
    fetchTodos,
    fetchATodo,
    deleteTodo,
    updateTodo,
    todoByUser
};