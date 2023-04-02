const express = require('express');
const app = express();
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const tesseract = require("node-tesseract-ocr")
const lineReader = require('line-reader');

const hostname = '127.0.0.1';
const PORT = process.env.PORT || 4000;

let names;

const storage = multer.diskStorage(
  {
    destination: (req, file, cb) => {
      console.log(file);
      cb(null, 'images');
    },
    filename: (req, file, cb) => {
      names = file.originalname;
      cb(null, file.originalname)

    }
  }
)



const upload = multer({ storage: storage });
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'home.html'));


})

app.post('/', upload.single('image'), (req, res) => {

  // console.log(req.upload);
  const data = fs.readFileSync(`./images/${names}`);

  const config = {
    lang: "eng",
    oem: 1,
    psm: 3,
  }

  tesseract
    .recognize(data, config)
    .then((text) => {
      console.log("Result:", text)
      /*const nameIndex=text.indexOf("Name :") +6 ; 
      console.log(nameIndex)
      const temp1=text.substring(0,nameIndex);
      console.log(temp1);
      const nameLength = temp1.split('\n').length ;
      console.log(nameLength);
      // console.log(text.startsWith('Name :'));
      console.log(text.substring(nameIndex,nameIndex+nameLength).trim()); */

      // For VOTER CARD
      if (req.body.idType == 'voterid') {
        //Extracting Voter id 
        const temp3=text.split('ELECTOR PHOTO IDENTITY CARD\r\n\r\n',2);
        console.log(temp3);
        const idind=temp3[1].indexOf('\r\n');
        const Id=temp3[1].substring(idind -10,idind);
        
        
        
        //Extracting personal info
        const nameIndex = text.indexOf("Name :", 0);
        console.log(nameIndex);
        // console.log(text[184])
        const temp1 = text.split("Name :", 2);
        // console.log(temp1[1]);
        const str1 = temp1[1].split("\r\n", 2);
        const name = str1[0].trim();



        const fatherIndex = text.indexOf("Father's ");
        console.log(fatherIndex)
        // console.log(fatherIndex,text[236])
        const temp2 = text.split("Father's Name :", 2);
        // console.log(temp2);
        const str2 = temp2[1].split("\n", 2);
        const fatherName = str2[0].trim();

        res.json({
          idType:'voterCard',
          voterIdNumber:Id,
          info:{

            name: name,
            fatherName: fatherName
          }
        });
      } //For AADHAR CARD
      else if (req.body.idType == 'aadharid') {
        // Extracting personal info
        const nameIndex = text.indexOf("DOB: ", 0);
        console.log(nameIndex);

        const temp1 = text.split("DOB: ", 2);

        const lastind = temp1[0].lastIndexOf('\r\n\r\n');
        const str2 = temp1[0].substring(0, lastind);
        const begin = str2.lastIndexOf('\r\n') + 2;
        console.log(begin);


        const Name = temp1[0].substring(begin, lastind)
        const str1 = temp1[1].split("\r\n", 2);
        const dobstr = str1[0].trim();
        const str3 = str1[1].split('/ ', 2);
        const genderstr = str3[1].split('\r\n', 2);
        const gender = genderstr[0];
        const dob = dobstr;

        //Extracting VID and AAdhar number
        const vid = text.split('VID', 2);
        const endind = vid[1].indexOf('\r\n');
        const strind = vid[1].indexOf(': ') + 2;
        const Vid=vid[1].substring(strind, endind);
        const endind2 = vid[0].lastIndexOf('\r\n\r\n');
        const aadharNum = vid[0].substring(endind2 - 14, endind2);

        res.json({
          idType: 'aadharCard',
          aadharNumber: aadharNum,
          vId:Vid,
          info: {
            name: Name,
            dob: dob,
            gender: gender

          }
        })
      }
      else if(req.body.idType=='drivingL')
      {
          console.log(text);
      }
      else if(req.body.idType=='pancard')
      {
        console.log(text);
      }
    }).catch((error) => {
      console.log(error.message)
      // res.send("DONE");
    })
  })

  app.listen(PORT, () => {
    console.log(`Server listening at port http://${hostname}:${PORT}`)
  })
