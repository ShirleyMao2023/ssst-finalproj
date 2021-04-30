const functions = require("firebase-functions");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// const express = require("express");
// const app = express();
// app.get("*", (req, res) => {
//   res.send("Hello from the API");
// });
// exports.api = functions.https.onRequest(app);

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mysql = require("mysql");
const cors = require("cors");


let config = {
    user: process.env.SQL_USER,
    database: process.env.SQL_DATABASE,
    password: process.env.SQL_PASSWORD,
}

if (process.env.INSTANCE_CONNECTION_NAME && process.env.NODE_ENV === 'production') {
  config.socketPath = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
}

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.post("/api/search", (require, response) => {
    console.log("Searching");

    songName = require.body.songName;
    year = require.body.year;
    genre = require.body.genre;
    length = require.body.length;
    isExplicit = require.body.explicit;
    artist = require.body.artist;
    var i = isExplicit ? 1 : 0;
    explicit = " s.Explicit =" + i.toString();

    if (songName.length) {
        songName = " LOWER(s.Song_Name) LIKE '%" + songName + "%'";
    }
    
    if (year.length) {
        year = " s.Release_year = " + year;
    }
    if (genre.length) {
        genre = " LOWER(s.Genre_Name) LIKE '%" + genre + "%'";
    }
    if (length.length) {
        length = " s.Length =" + length;
    }
    if (artist.length) {
        artist = " LOWER(a.Name) LIKE '%" + artist + "%'";
    }
    
    if (songName.length && (year.length ||genre.length || length.length || artist.length ||explicit.length)) {
        songName = songName + " AND ";
    }
    if (year.length && (genre.length || length.length || artist.length || explicit.length)) {
        year = year + " AND ";
    }
    if (genre.length && (length.length || artist.length || explicit.length)) {
        genre = genre + " AND ";
    }
    if (length.length && (explicit.length || artist.length)) {
        length = length + " AND ";
    }
    if (artist.length && explicit.length) {
        artist = artist + " AND ";
    }
    const sqlSearch = "SELECT s.Song_Name, a.Name AS Artist_Name, s.Release_year, s.length/1000 AS Length_in_Sec, s.genre_name AS Genre, s.explicit AS Explicit" + 
    " FROM Song s JOIN artist a ON s.ArtistID = a.Name "+
    " WHERE " + songName + year + genre + length +  artist + explicit;
    // console.log(sqlSearch)
    db.query(sqlSearch, function (err, rows) {
        if (err) throw err;
        response.send(rows);
        console.log(rows)
        
      });
      console.log("Clicked Search ");
});

// app.post("/api/lookup", (require, response) => {
//     console.log("Lookup");
//     artist = require.body.artist;
    
//     const sqlSearch = "SELECT  ArtistId, Name FROM artist WHERE Name LIKE '%" + artist+"%'";
//     // console.log(sqlSearch)
//     db.query(sqlSearch, function (err, rows) {
//         if (err) throw err;
//         response.send(rows);
        
//       });
//       console.log("Clicked Lookup ");
// });
// app.post("/api/delete", (require, response) => {
//     console.log("deleteUser");
//     userID = require.body.userID;

//     const sqlDelete = "DELETE FROM Account "+
//     " WHERE UserID LIKE '" + userID + "'";
//     console.log(sqlDelete);
//     db.query(sqlDelete, function (err, rows) {
//         if (err) throw err;
//         console.log("DELETE Success! " + JSON.stringify(rows));
//       });
// });

// app.put("/api/update/", (require, response) => {
//     const artistId = require.body.artistId;
//     const songNum = require.body.songNum;
//     const artistName = require.body.artistName;
//     strMssg = "";
//     const sqlQUERY = "SELECT * FROM artist WHERE ArtistId LIKE ?";
//     db.query(sqlQUERY, [artistId], (err, rows) => {
//         if (err) 
//         console.log(error);
//         strMssg += "Before => " +JSON.stringify(rows);
//     })
//     const sqlUpdate = "UPDATE artist SET song_num = ? WHERE ArtistId LIKE ? OR Name LIKE ?";
//     db.query(sqlUpdate, [songNum, artistId, artistName], (err, result) => {
//         if (err) 
//         console.log(error);
//     })
//     db.query(sqlQUERY, [artistId], (err, rows) => {
//         if (err) 
//         console.log(error);
//         response.send(strMssg + "After => " +JSON.stringify(rows));
//     })
// });

// app.post("/api/newUser", (require, response) => {
//     const name = require.body.name;
//     const email = require.body.email;
//     const password = require.body.password;
//     strMssg = "";

//     const sqlInsert = "INSERT INTO Account (UserID, Name, Email, Password) VALUES (?,?,?,?)";
//     db.query(sqlInsert, ['',name, email, password], function (err, rows) {
//         if (err) throw err;
//         console.log("Success! " + JSON.stringify(rows));
//       });  
//     const sqlQUERY = "SELECT * FROM Account WHERE email LIKE '"+email +"'";
//     db.query(sqlQUERY,(err, rows) => {
//         if (err) 
//         console.log(rows);
//         response.send(rows);
//     })
// });

// app.post("/api/checkUser", (require, response) => {
//     email = require.body.email;
//     password = require.body.password;
    
//     const sqlSearch = "SELECT * FROM Account WHERE Email LIKE '" + email+"'" + "AND Password LIKE '" + password+"'";
//     db.query(sqlSearch, function (err, rows) {
//         if (err) throw err;
//         response.send(rows);
        
//       });
//       console.log("Clicked Lookup ");
// });

// app.listen(3002, () => {
//     console.log("running on port 3002");
// })


// // DELIMITER //
// // create TRIGGER uniqueSafeInsert
// //     before insert on Song
// //     for each row
// //     begin
// //     if 0 < (select count(*) from Song where Song.Song_Name = NEW.Song_Name and Song.ArtistID = New.ArtistID) then
// //         SIGNAL SQLSTATE '45000'
// //         SET message_text  = 'Song with same name and artist already exists, update existing records instead.';
// //     end if;
// //     if 0 < (select count(*) from Song where Song.ArtistID = New.ArtistID) then
// //         set NEW.SongId = (SELECT UUID());
// //         update artist set song_num = song_num + 1
// //         where artist.Name = NEW.ArtistId;
// //     else  
// //         set NEW.SongId = (SELECT UUID());
// //         Insert into artist values((SELECT UUID()), new.ArtistID, 1);
// //     end if;
// // end;
// // DELIMITER //
// // create TRIGGER newAccount
// //     before insert on Account
// //     for each row
// //     begin

// //     if 0 < (select count(*) from Account where Account.Email = NEW.Email) then
// //         SIGNAL SQLSTATE '45000'
// //         SET message_text  = 'Email Already in use.';
// //     end if;
// //     set NEW.UserID = (SELECT UUID());
// // end;
// exports.app = functions.https.onRequest(app)


