// Global variables for DOM elements
const noteTitle = document.querySelector('.note-title');
const noteText = document.querySelector('.note-textarea');
const saveNoteBtn = document.querySelector('.save-note');
const newNoteBtn = document.querySelector('.new-note');
const noteList = document.querySelector('.list-container');

// Function to show an element
const show = (elem) => {
  elem.style.display = 'inline';
};

// Function to hide an element
const hide = (elem) => {
  elem.style.display = 'none';
};

// Object to store the active note being edited
let activeNote = {};

// Function to fetch notes from the server
const getNotes = async () => {
  const response = await fetch('/api/notes', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return await response.json();
};

// Function to save a note to the server
const saveNote = async (note) => {
  const response = await fetch('/api/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(note),
  });
  return await response.json();
};

// Function to delete a note from the server
const deleteNote = async (id) => {
  await fetch(`/api/notes/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// Function to render the active note in the editor
const renderActiveNote = () => {
  hide(saveNoteBtn);

  if (activeNote.id) {
    noteTitle.setAttribute('readonly', true);
    noteText.setAttribute('readonly', true);
    noteTitle.value = activeNote.title;
    noteText.value = activeNote.text;
  } else {
    noteTitle.removeAttribute('readonly');
    noteText.removeAttribute('readonly');
    noteTitle.value = '';
    noteText.value = '';
  }
};

// Function to handle saving a note
const handleNoteSave = async () => {
  const newNote = {
    title: noteTitle.value,
    text: noteText.value,
  };
  await saveNote(newNote);
  getAndRenderNotes();
  renderActiveNote();
};

// Function to handle note deletion
const handleNoteDelete = async (e) => {
  // Prevents the click listener for the list from being called when the button inside of it is clicked
  e.stopPropagation();

  const note = e.target.parentElement;
  const noteId = JSON.parse(note.getAttribute('data-note')).id;

  if (activeNote.id === noteId) {
    activeNote = {};
  }

  await deleteNote(noteId);
  getAndRenderNotes();
  renderActiveNote();
};

// Function to handle viewing a note
const handleNoteView = (e) => {
  e.preventDefault();
  activeNote = JSON.parse(e.target.parentElement.getAttribute('data-note'));
  renderActiveNote();
};

// Function to handle entering a new note
const handleNewNoteView = (e) => {
  activeNote = {};
  renderActiveNote();
};

// Function to show or hide the Save button based on input contents
const handleRenderSaveBtn = () => {
  if (!noteTitle.value.trim() || !noteText.value.trim()) {
    hide(saveNoteBtn);
  } else {
    show(saveNoteBtn);
  }
};

// Function to render the list of note titles
const renderNoteList = (notes) => {
  noteList.innerHTML = ''; // Clear existing note list

  if (notes.length === 0) {
    noteList.innerHTML = '<li class="list-group-item">No saved Notes</li>';
  } else {
    notes.forEach((note) => {
      const li = document.createElement('li');
      li.classList.add('list-group-item');
      li.dataset.note = JSON.stringify(note);
      li.innerHTML = `
        <span class="list-item-title">${note.title}</span>
        <i class="fas fa-trash-alt float-right text-danger delete-note"></i>
      `;
      li.querySelector('.list-item-title').addEventListener('click', handleNoteView);
      li.querySelector('.delete-note').addEventListener('click', handleNoteDelete);

      noteList.appendChild(li);
    });
  }
};

// Function to get notes from the server and render them in the sidebar
const getAndRenderNotes = async () => {
  const notes = await getNotes();
  renderNoteList(notes);
};

// Event listeners for actions on the note editor
saveNoteBtn.addEventListener('click', handleNoteSave);
newNoteBtn.addEventListener('click', handleNewNoteView);
noteTitle.addEventListener('keyup', handleRenderSaveBtn);
noteText.addEventListener('keyup', handleRenderSaveBtn);

// Check if the page is '/notes' before fetching and rendering notes
if (window.location.pathname === '/notes') {
  getAndRenderNotes();
}
