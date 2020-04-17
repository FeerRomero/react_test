import React, { useState, useRef } from 'react';
import { Button,  Form, Jumbotron, Card } from 'react-bootstrap'
import * as Icon from 'react-bootstrap-icons'
import './index.css'

function TaskForm( { addTodo, funcSwitching } ) {
	const [listSwitching, setListSwitching] = funcSwitching()
	const [description, setDescription] = useState("");
	const [title, setTitle] = useState("");
	
	const handleSubmit = event => {
		event.preventDefault();
		if (description.length === 0) {
			return
		}
		else {
			if (title.length === 0) {
				return
			}
			else {
				addTodo(title, description);
				setDescription("");
				setTitle("");
			}
		}
	}

	return (
		<Card className="col-9 col-md-6 todo-card" key={0}>
			<Card.Body className="text-center">
				<Card.Title> <h2>Add New Task</h2></Card.Title>
				<Form onSubmit={handleSubmit}>
					<Form.Group className="text-left">
						<Form.Label><strong>Title</strong></Form.Label>
		    			<Form.Control id="todo_title" value={title} required type="text" onChange={event => setTitle(event.target.value)} placeholder="The task's title" />
						<Form.Label><strong>Description</strong></Form.Label>
		    			<Form.Control id="todo_description" value={description} required type="text" as="textarea" rows="3" onChange={event => setDescription(event.target.value)} placeholder="A brief explanation of the task" />
					</Form.Group>
					<Button className="col-9 col-md-5 col-lg-4 btnAddTodo" disabled={listSwitching} variant="primary" type="submit">
						Add Task
					</Button>
				</Form>
			</Card.Body>
		</Card>
		)
}

function ToDo({ task, doneTask , deleteTask, redoTask, editTask, funcSwitching}) {
	const titleRef = useRef(null);
	const textRef = useRef(null);
	const [isEditable, setIsEditable] = useState(false)
	const [isBtnDisabled, setIsBtnDisabled] = funcSwitching()

	let idx = task.id
	
	const handleSave = () => {
		editTask(idx, titleRef.current.textContent, textRef.current.textContent);
	}


	return (
		<>
			<Card className={ (isEditable && isBtnDisabled) ? "col-9 col-md-6 m-3 todo-card primary-color-bg" : "col-9 col-md-6 m-3 todo-card"}>
				<div className="d-flex justify-content-between">
					{ !isEditable ? (
							<Button className="mt-3 btn-todo-edit" onClick={() => { setIsEditable(!isEditable); setIsBtnDisabled(!isBtnDisabled)}} disabled={(isEditable ^ isBtnDisabled)}><Icon.Pencil className="btn-corner" size={24} /></Button>
						) :
						(
							<Button className="mt-3 btn-todo-save" onClick={() => { setIsEditable(!isEditable); handleSave(); setIsBtnDisabled(!isBtnDisabled)}} disabled={(isEditable ^ isBtnDisabled)}><Icon.Check className="btn-corner btn-checkmark" size={24} /></Button>
						)
					}
					<div className={(isEditable && isBtnDisabled) ? "mt-4 visible highlighted-text text-center" : "invisible"}> Save changes before resuming! </div>
					<Button className="mt-3 btn-todo-delete" onClick={() => deleteTask(idx)} disabled= {isBtnDisabled}><Icon.X className="btn-corner" size={24} /></Button>
					
				</div>
					
				<Card.Body className = "text-center pt-0">
					<Card.Title ref={titleRef} className={task.isDone ? "crossed-text" : ""} 
						contentEditable={isEditable}>
						<span className={isEditable ? "editable-text" : ""}>
							{task.title}
						</span>
					</Card.Title>

					<Card.Text ref={textRef} className="todo-text" contentEditable={isEditable}>
						<span className={isEditable ? "editable-text" : ""}>{task.text}</span>
					</Card.Text>
					{ !task.isDone === true ? ( 
						<>
							<Button className="col-9 col-md-5 col-lg-4 m-1" variant="success" onClick={() => doneTask(idx)} disabled={isBtnDisabled}> Done </Button>
						</>
						) : (
						<>
							<Button className="col-9 col-md-5 col-lg-4 m-1" variant="info" onClick={() => redoTask(idx)} disabled={isBtnDisabled}> Re-do </Button>
						</>
						)
					}
				</Card.Body>
			</Card>
	    </>
	)
}

function useLocalStorage(key, defaultValue) {
	const [storedValue, setStoredValue] = useState(() => {
		try {
			const item = window.localStorage.getItem(key);
			return item ? JSON.parse(item) : defaultValue;
		} catch (error) {
			console.log(error);
			return defaultValue;
		}
	});

	const setValue = value => {
		try {
			const valueToStore =
				value instanceof Function ? value(storedValue) : value;
			setStoredValue(valueToStore);
			window.localStorage.setItem(key, JSON.stringify(valueToStore));
		} catch (error) {
			console.log(error);
		}
	}

	return [storedValue, setValue];
}

function Tasks() {
	const [savedTasks, setSavedTasks] = useLocalStorage("tasks", []);
	const [todos, setTodos] = useState(savedTasks);
	const [listSwitching, setListSwitching] = useState(false)
	
	const addTodo = (title, text) => {
		const todosTemp = [
			...todos,
			{
				id: todos.length,
				title: title,
				text: text,
				isDone: false
			}
		]
		setTodos(todosTemp);
		setSavedTasks(todosTemp);
		return todos.length
	};

	const doneTask = index => {
		const todosTemp = [...todos]
		for (let i = 0; i < todosTemp.length; i++) {
			if (todosTemp[i].id === index) {
				todosTemp[i].isDone = true
			}
		}
		setTodos(todosTemp)
		setSavedTasks(todosTemp);
	}

	const deleteTask = index => {
		const todosTemp = [...todos]
		for (let i = 0; i < todosTemp.length; i++) {
			if (todosTemp[i].id === index) {
				todosTemp.splice(i, 1)
			}
		}
		setTodos(todosTemp)
		setSavedTasks(todosTemp);	
	}

	const redoTask = index => {
		const todosTemp = [...todos]
		for (let i = 0; i < todosTemp.length; i++) {
			if (todosTemp[i].id === index) {
				todosTemp[i].isDone = false;	
			}
		}
		setTodos(todosTemp)
		setSavedTasks(todosTemp);	
	}

	const editTask = (index, newTitle, newText) => {
		if (newTitle.length === 0) {
			return;
		}
		if (newText.length === 0) {
			return;
		}

		const todosTemp = [...todos]
		for (let i = 0; i < todosTemp.length; i++) {
			if (todosTemp[i].id === index) {
				todosTemp[i].title = newTitle;
				todosTemp[i].text = newText;	
			}
		}
		setTodos(todosTemp)
		setSavedTasks(todosTemp);	
	}

	const funcSwitching = () => {
		return [listSwitching, setListSwitching]
	}


	todos.sort(function (taskA, taskB) {
		if (taskA.title.toString().toLowerCase() > taskB.title.toString().toLowerCase()) {
			return 1;
		}
		if (taskB.title.toString().toLowerCase() > taskA.title.toString().toLowerCase()) {
			return -1;
		}
		return 0;
	})

	let doneTasks = []
	let pendingTasks = []
	
	for (let i = 0; i < todos.length; i++) {
		if (todos[i].isDone) {
			doneTasks.push(todos[i])
		}
		else {
			pendingTasks.push(todos[i])
		}
	}


	return (
		<>
		<div className="Tasks-App tertiary-color-bg">
			<Jumbotron className="text-center primary-color-bg">
				<h1>My Tasks</h1>
				<p>Use this app to manage your tasks!</p>
			</Jumbotron>
			
			<div className="container">
				<div className="row justify-content-center">
					<div className="container row justify-content-center">
						<TaskForm addTodo={addTodo} funcSwitching = {funcSwitching} />
					</div>
				</div>

				<div className="row mt-4 mb-2 p-2 border-bottom border-dark justify-content-center">
					<h2> ToDo List </h2>
					
					<div className="container row justify-content-around">
				    	{ pendingTasks.length === 0 ? (
				    			<>
				    			<Icon.FileEarmark className="col-9 empty-list" />
				    			<h5 className="col-9 text-center">No tasks pending</h5>
				    			</>
				    		) : (
					    		pendingTasks.map(todo => (
					    		<ToDo 
						    		task = {todo} 
						    		doneTask = {doneTask}
						    		deleteTask = {deleteTask}
						    		editTask = {editTask}
						    		funcSwitching = {funcSwitching}
						    	/>)
					    		)
				    		)
				    	}
					</div>
				</div>

				<div className="row mt-4 mb-2 justify-content-center">
					<h2> Done List </h2>
					<div className="container row justify-content-around">
							
					    	{ doneTasks.length === 0 ? (
					    			<>
					    			<Icon.FileEarmarkCheck className="col-9 empty-list" />
					    			<h5 className="col-9 text-center">No tasks marked as done</h5>
					    			</>
					    		) : (
						    		doneTasks.map(todo => (
							    		<ToDo 
								    		task = {todo} 
								    		deleteTask = {deleteTask}
								    		redoTask = {redoTask}
								    		editTask = {editTask}
								    		funcSwitching = {funcSwitching}
								    	/>)
								    )
					    		)
					    	}
					</div>
				</div>
		    </div>
	    </div>
	    </>
		)
}


export default Tasks;