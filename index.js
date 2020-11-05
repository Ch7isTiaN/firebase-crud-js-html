//Traer la variable global de firestore
const db = firebase.firestore();

const taskForm = document.querySelector("#task-form");
const taskContainer = document.getElementById('tasks-container');

//Variable para manejar el status del formulario
let editStatus = false;
let id = ''; //Creamos el id vacío al inicio



// ------ FUNCIONES CRUD ------------ //
//Guardar un documento en la base de datos Firestore
const saveTask = (title, description) => 
  db.collection('tasks').doc().set({
    title,
    description
  })

//Listar los documentos de la colección task
const getTasks = () => db.collection('tasks').get();

//Listar un documento a partir de un id pasado como parámetro
const getTask = id => db.collection("tasks").doc(id).get();

//Traer los cambios (insert o delete) utilizando un metodo de Firebase
const onGetTask = (callback) => db.collection("tasks").onSnapshot(callback);

//Eliminar un documento a partir de un id pasado como parametro
const deleteTask = id => db.collection('tasks').doc(id).delete();

//Actualizar un documento
const updateTask = (id, updatedTask) => 
  db.collection('tasks').doc(id).update(updatedTask);
// ------ / FUNCIONES CRUD ------------ //





// ------ CARGA DEL DOM ------------ //
window.addEventListener('DOMContentLoaded', async (e) => {
  onGetTask((querySnapshot) =>{
    taskContainer.innerHTML = '';
    querySnapshot.forEach(doc => {  
      
      const task = doc.data();
      task.id=doc.id; //Agrega el id al objeto doc.data()
      
      taskContainer.innerHTML += `
        <div class="card card-body mt-2 border-primary">
          <h3 class="h5">${task.title}</h3>
          <p>${task.description}</p>
          <div>
            <button class="btn btn-primary btn-delete" data-id="${task.id}">Delete</button>
            <button class="btn btn-secondary btn-edit" data-id="${task.id}">Edit</button>
          </div>
        </div>`;

        const btnDelete = document.querySelectorAll(".btn-delete");
        btnDelete.forEach((btn) => {
          btn.addEventListener("click", async (e) => {
            console.log(e.target.dataset.id); //Para capturar el id
            await deleteTask(e.target.dataset.id); //llama a la función para elminar
          });
        });

        const btnEdit = document.querySelectorAll(".btn-edit");
        btnEdit.forEach(btn => {
          btn.addEventListener("click", async (e) => {
            const doc = await getTask(e.target.dataset.id); //llama a la función para listar el documento por id
            const task = doc.data();

            editStatus = true;
            id = doc.id;
            console.log(id);
            console.log(task.title, task.description);
            taskForm["task-title"].value = task.title;
            taskForm["task-description"].value = task.description;
            taskForm["btn-task-form"].innerText = 'Update';

          });
        });


    });
  })
})
// ------ / CARGA DEL DOM ------------ //




// ------ ACCIONES AL PRESIONAL BOTONES ------------ //
taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = taskForm['task-title'];
  const description = taskForm["task-description"];

  //Validamos el estado del formulario
  if(!editStatus){
    await saveTask(title.value, description.value)
  } else {
    await updateTask(id, {
      title: title.value,
      description: description.value
    });

    //Despues de editar, reiniciamos el valor del estado a False para guardar
    editStatus = false;
    //Reiniciamos el id en blanco
    id = '';
    //Regresamos el valor del boton a 'Save'
    taskForm["btn-task-form"].innerText = "Save";

  }

  taskForm.reset();
  title.focus();
})
// ------ ACCIONES AL PRESIONAL BOTONES ------------ //