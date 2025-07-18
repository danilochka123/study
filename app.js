//Globals
let todos = [];
let users = [];

//DOM elements
const form = document.querySelector('.ToDo-form');
const list = document.querySelector('.ToDo-list');
const userSelect = document.querySelector('.ToDo-form__select');

// Attach Events
form.addEventListener('submit', getData)
document.addEventListener('DOMContentLoaded', initApp)

// Basic Logic
function getUserName(userId){
    const user = users.find(user => user.id === userId);
    return user.name;
}

function addUserToOption(user){
    const option = document.createElement('option');
    option.value = user.id;
    option.innerText = user.name;

    userSelect.append(option);
}

function addToList({id, userId, title, completed}) {
    const li = document.createElement('li');
    li.classList.add('ToDo-list__item');
    li.dataset.id = id;
    li.innerHTML = `<span class='ToDo-list__text'>${title} <i>by</i> <b>${getUserName(userId)}</b></span>`;
    list.prepend(li);

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = completed;
    input.addEventListener('change', handleTodoChange)
    li.prepend(input)

    const close = document.createElement('span');
    close.innerHTML = '&times;';
    close.classList.add('ToDo-list__close');
    close.addEventListener('click', handleClose);
    li.append(close);
}

function removeTodo(idTodo){
    todos = todos.filter(todo => todo.id !== idTodo);
    const todo = list.querySelector(`[data-id="${idTodo}"]`);
    
    todo.querySelector('input').removeEventListener('change', handleTodoChange);
    todo.querySelector('.ToDo-list__close').removeEventListener('click', handleClose);

    todo.remove();
}

function alertError(error){
    alert(error.message)
}
//event logic
function getData(event) {
    event.preventDefault();
    
    createTodo({
        userId: Number(form.user.value),
        title: form.todo.value,
        completed: false
    })
}

function initApp(){
    Promise.all([getAllTodos(), getAllUsers()]).then(values =>{
        [todos, users] = values;      
        
        //отправка данных с сервера в разметку
        todos.forEach(todo => addToList(todo));
        users.forEach(user => addUserToOption(user));
    }) 
}

function handleTodoChange(){
    const todoId = this.parentElement.dataset.id;
    const completed = this.checked;

    toggleTodoComplete(todoId, completed)
}

function handleClose(){
    const todoId = this.parentNode.dataset.id;
    
    deleteTodo(todoId);
}

// async logic
async function getAllTodos() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/todos');
        const data = await response.json();
    
        return data;    
    } catch (error) {
        alertError(error);
    }
};

async function getAllUsers() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        const data = await response.json();
    
        return data;    
    } catch (error) {
        alertError(error);
    }
};

async function createTodo(todo) {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/todos', {
            method: 'POST',
            body: JSON.stringify(todo),
            headers: {
                'Content-Type': 'aplication/json',
            }
        });
    
        const newTodo = await response.json();
    
        addToList({id:newTodo, ...todo});
    } catch (error) {
        alertError(error);
    }
};

async function toggleTodoComplete(TodoId, completed) {
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${TodoId}`,{
            method: 'POST',
            body: JSON.stringify({completed}),
            headers: {
                'Content-Type': 'aplication/json',
            }
        });
    
        if(!response.ok){
            throw new Error("Failed to connect with the server!");
        }
    } catch (error) {
        alertError(error);
    }
}

async function deleteTodo(todoId) {
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${todoId}`,
        {
            method: 'DELETE',
            headers: {
                'Content-Type': 'aplication/json',
            }
        });
    
        if (response.ok){
            removeTodo(todoId);
        } else{
            throw new Error("Failed to connect with the server!");
        }
    } catch (error) {
        alertError(error);
    }
}