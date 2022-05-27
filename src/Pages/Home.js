import React, {useState, useEffect} from 'react';
import AppNavBar from '../Components/AppNavBar';
import ApplicantList from '../Components/ApplicantList';
import UserModal from '../Components/UserModal';
import Countdown from 'react-countdown';
import {authenticationService as auth} from '../Services/authenticationService';
import {nameService as nameSvc} from '../Services/nameService';
import {Button} from 'react-bootstrap';
import {authHeader} from '../Helpers/authHeader';
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import axios from "axios";
//import {useForm} from 'react-hook-form';
const duration_msec = 60 * 60 * 1000;
const customAxios = (contentType) => {
    // axios instance for making requests
    const axiosInstance = axios.create({
      // your other properties for axios instance
      headers: {
        'Content-Type': contentType,
        'Authorization': authHeader()
      },
    });
  
    // your response interceptor
    axiosInstance.interceptors.response.use();
  
    return axiosInstance;
};

const Home = () => {

    const [showModal, toggleShowModal] = useState(false);
    const [displayLogin, toggleDisplayLogin] =  useState(false);
    const [fileDownloaded, toggleFileDownloaded] = useState(false);
    const [username, setUsername] = useState("");
    const [fileUploadDialog, setFileUploadDialog] = useState(false);
    const [fileUploadSuccessful, setFileUploadSuccessful] = useState("");
    const [showApplicantList, setShowApplicantList] = useState(false);
    const [file, setFile] = useState();
    const [elapsedTime, setElapsedTime] = useState(0);
    
    //const [register, handleSubmit] = useForm();

    // useEffect (() => {
    //     if (nameSvc.currentNameValue && nameSvc.currentNameValue.length>0)
    //        window.localStorage.setItem("name", JSON.stringify(nameSvc.currentNameValue))
    //      },[nameSvc.currentNameValue])

    useEffect(() => {
        if(auth.loggedIn) {
            // console.log("checking if file has been downloaded");
            // console.log("isFileUploadSuccessful?", fileUploadSuccessful);   
            isDownloaded()
        }
    }, [nameSvc.currentNameValue])

    const isDownloaded = async() => {
        let username = auth.getUsernameFromJWT();
        await axios.get("/api/customers/getByUsername/" + username, {
            headers: {
                'Authorization': authHeader()
            },
        }).then(response => {
            console.log("Contents of applicant", response.data);
            toggleFileDownloaded(response.data.fileDownloaded);
            console.log("isFileUploadSuccessful?", fileUploadSuccessful);
            console.log("isFileDownloaded?", fileDownloaded);
        }).catch(err => console.log(err));
    }
    function openRegistrationForm() {
        toggleShowModal(true);
        toggleDisplayLogin(false);
    } 
    function openLoginForm() {
        toggleShowModal(true);
        toggleDisplayLogin(true);
    }
    function onHide() {
        toggleShowModal(false);
    }
    function logout() {
        // console.log("Logging out");
        auth.logout();
        //username persists despite attempt to rerender with new state
        setShowApplicantList(false);
        toggleFileDownloaded(false); 
        setFileUploadDialog(false);   
        setUsername("temp");
        setUsername("");
        setFileUploadSuccessful("");
        setElapsedTime(0);
    }

    const downloadFile = async(user) => {
        let username = auth.getUsernameFromJWT();
        let url = "/api/customers/downloadFile/" + username;
        if(nameSvc.currentRoleValue.roleName === "ROLE_ADMIN")
            url = "/api/admin/downloadFile/"+ username;
        await axios.get(url, {
            headers: {
                'Authorization': authHeader()
            },
            responseType: 'blob',
        }).then(response => {
            console.log(response.headers);
            console.log(response.data);
            const filename =  response.headers['content-disposition'].split('filename=')[1];
            const url = window.URL.createObjectURL(new Blob([response.data]));
            
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename); //or any other extension
            document.body.appendChild(link);
            link.click();
            toggleFileDownloaded(true);
            setFileUploadDialog(true);
        }).catch(err => {
            console.log(err)
            if(err.response.data === "No file available for upload")
                toast(err.response.data);
        });
        
    }

        //start timer
    
    function uploadFile() {
        setShowApplicantList(false);
        setFileUploadDialog(true);
        setFileUploadSuccessful("");
        setElapsedTime(0);
    }

    function redirect(username) {
        toggleDisplayLogin(true);
        setUsername(username);
    }

    function gotoApplicantList() {
        setFileUploadDialog(false);
        setFileUploadSuccessful("");
        setShowApplicantList(true);
        console.log("goToApplicantList");
    }
    function handleChange(event) {
        //console.log("Handle Change Event", event);
        setFile(event.target.files[0])
        setElapsedTime(0);
        console.log("file upon handleChange", file);  
    }

    // function readFileDataAsBase64(file) {
    //     return new Promise((resolve, reject) => {
    //         const reader = new FileReader();
    //         reader.onload = (event) => {
    //             resolve(event.target.result)
    //         }
    //         reader.onerror = (err) => {
    //             reject(err);
    //         }

    //         reader.readAsDataURL(file);
    //     })
    // }

    const getElapsedTime = () => {
        //console.log("get elapsed time");
        let username = auth.getUsernameFromJWT();
        axios.get("/api/customers/getElapsedTime/" +  username,
        {
            headers: {
                'Authorization': authHeader()
            },
        }).then(response => {
            
            let elapsedTime = parseInt(response.data, 10) * 1000;
            console.log("Got elapsed time", elapsedTime);
            setElapsedTime(elapsedTime);
        }).catch(err => console.log(err));

    }
    const onSubmit = async(event) => {
        event.preventDefault();
        let username = auth.getUsernameFromJWT();
        let url = '/api/customers/uploadFile/' +  username;
        if(nameSvc.currentRoleValue.roleName === "ROLE_ADMIN")
            url = '/api/admin/uploadFile/' + username;

        const formData = new FormData();
        formData.append("file", file);
       
        await customAxios('multipart/form-data').post(url, formData)
        .then((response) => {
          console.log(response.data);
          setFileUploadDialog(false);
          setElapsedTime(0);
        //   setFileUploadSuccessful(response.data.fileName);
          toast(response.data);
        }).catch(err => {
            console.log(err);
            if(err.response.data.startsWith("Upload filename must match download filename"))
            {
                // console.log("File name mismatch");
                toast(err.response.data)
            }
        });
    
    }

    const renderer = ({ hours, minutes, seconds, completed }) => {
        if (completed) {
        // Render a completed state
        return <span>Timer Expired</span>;
        } else {
        // Render a countdown
        return <span>{hours}:{minutes}:{seconds}</span>;
        }
    };
    // function handleUpload(event) {
    //     event.preventDefault()
    //     let username = auth.getUsernameFromJWT();
    //     let url = '/api/customers/uploadFile/' +  username;
    //     if(nameSvc.currentRoleValue === "ROLE_ADMIN")
    //         url = '/api/admin/uploadFile/' + username;
    //     console.log("file", file);
    //     const fileData = readFileDataAsBase64(file)
    //     const attachment = {
    //         id: null,
    //         username: username,
    //         fileName: file.name,
    //         fileType: file.type,
    //         fileData: fileData
    //     }
    //     console.log(attachment);
    //     const config = {
    //         headers: {
    //             'Accept': 'application/json',
    //             'Content-Type': 'application/json', 
    //             'Authorization': authHeader()
    //         },
    //       };
    //     axios.post(url, attachment, config).then((response) => {
    //       console.log(response.data);
    //     }).catch(err => console.log(err));
    
    // }
    return ( <div>
            
            <UserModal show={showModal}
                onHide = {onHide}
                displayLogin = {displayLogin}
                redirect = {redirect}
                username = {username} />
            <AppNavBar 
                openRegistrationForm = {openRegistrationForm}
                login = {openLoginForm}
                logout = {logout}
                username = {username}
                uploadFile = {uploadFile}
                downloadFile = {downloadFile}
                fileDownloaded = {fileDownloaded}
                gotoApplicantList = {gotoApplicantList} />
            {!auth.loggedIn ?
                <h3>Register/login in order to download file</h3> : <div/>
            }


            {(fileDownloaded && fileUploadSuccessful === "") ? 
                <div>

                    {elapsedTime === 0 ?
                        getElapsedTime() : 

                    <Countdown
                        date={Date.now() + (duration_msec - (elapsedTime))}
                        renderer = {renderer}
                    />
                    }
                </div>
                : <div/>
            }
            <ToastContainer/>
            {fileUploadDialog ? (
                <div>
                    <form onSubmit={onSubmit}>
                        <h1>Upload file</h1>
                        <input type="file" onInput={handleChange}/>
                        <Button type="submit">
                            Upload
                        </Button>
                    </form>
                </div> ) :
                <div/>
            }
            
            {showApplicantList ?
                <div>
                    <ApplicantList/>
                </div> : <div/>
            }
        </div>)
}

export default Home;
