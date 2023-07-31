// Library imports
const express = require('express');
const path = require('path');
const fs = require('fs');
const jsonuuid = require('json-uuid');

const databaseFile = 'db.json';
const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Default route
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '/public/index.html')));

// Notes routes 
app.get('/notes', (req, res) => res.sendFile(path.join(__dirname, '/public/notes.html')));

// Return all notes from database
app.get('/api/notes', (req, res) => {
  const dbPath = path.join(__dirname, 'db', databaseFile);
  return res.sendFile(dbPath);
});

// Post
app.post('/api/notes', (req, res) => {
  const { title, text } = req.body;

  if (title && text) {
    const newNote = {
      title,
      text,
      id: jsonuuid.id(title)
    };

    fs.readFile(path.join(__dirname, 'db', databaseFile), (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json("Error posting new note");
      }

      let databaseParsed = JSON.parse(data);
      databaseParsed.push(newNote);

      fs.writeFile(path.join(__dirname, 'db', databaseFile), JSON.stringify(databaseParsed), (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json("Error posting new note");
        }
        console.log("New note added to JSON file");
        return res.status(201).json(JSON.stringify(newNote));
      });
    });
  } else {
    return res.status(500).json("Error posting new note");
  }
});

// Delete
app.delete('/api/notes/:id', (req, res) => {
  const id = req.params.id;

  fs.readFile(path.join(__dirname, 'db', databaseFile), (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json("Error deleting note");
    }

    let parsedDatabase = JSON.parse(data);

    const newDatabase = parsedDatabase.filter((note) => note.id !== id);

    fs.writeFile(path.join(__dirname, 'db', databaseFile), JSON.stringify(newDatabase), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json("Error deleting note");
      }
      console.log("Removed note with ID of: " + id);
      return res.json('Successfully deleted note with ID of ' + id);
    });
  });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, '/public/index.html')));

// ------------------ Start Server -----------------------
app.listen(PORT, () =>
  console.log(`Example app listening at http://localhost:${PORT}`)
);