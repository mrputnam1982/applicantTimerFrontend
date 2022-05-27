import React, { useEffect, useState} from 'react'
import {Link} from 'react-router-dom'
import {authHeader} from '../Helpers/authHeader';
import {authenticationService as auth} from '../Services/authenticationService';    
import {ListGroup, Button} from 'react-bootstrap';
import axios from 'axios';
const ApplicantList = (props) => {
    const [admin, setAdmin] = useState(false);
    const [applicants, setApplicants] = useState([]);
    useEffect(() => {
        console.log("useEffect called");
        isAdminRole();
        console.log("isAdmin?", admin);
        if(admin) getApplicants();
    },[admin])

    const getApplicants = () => {
        axios.get('/api/customers', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': authHeader()
            }
        }).then(response => {
            console.log("getApplicants", response.data);
            let validList = response.data.filter(user => {
                return user.name !== "Admin"
            })
    
            setApplicants(validList);
        }).catch(err => console.log(err));
    }

    const isAdminRole= async() => {
        let username = auth.getUsernameFromJWT();
        await axios.get(`/api/customers/getByUsername/${username}`,
        {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': authHeader()
                    }
        }).then(response => {
            console.log(response.data.roles[0].roleName);
            if(response.data.roles[0].roleName === "ROLE_ADMIN") {
                console.log("setAdmin true");               
                setAdmin(true);
            }
            else setAdmin(false);
        }).catch(err => console.log(err));
    }

    const downloadFile = async(username) => {

        let url = "/api/admin/downloadFile/" + username;
 
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
        }).catch(err => console.log(err));
        
    }

    const parseUploadTime = (timeToUpload) => {
        
        let hoursToUpload = parseInt(timeToUpload/3600);
        let minsToUpload = parseInt((timeToUpload - hoursToUpload * 3600) / 60);
        let secsToUpload = parseInt((timeToUpload - (hoursToUpload * 3600) - (minsToUpload * 60)));
        let formattedTimeToUpload = hoursToUpload + " hr(s), " + minsToUpload +
            " min(s), and " + secsToUpload + " sec(s)"
        if(timeToUpload > 3600) { 
            return <div>{formattedTimeToUpload} exceeds 1 hour limit</div>
        }
        else return <div>{formattedTimeToUpload}</div>
    }
    const applicantSorted = applicants.sort((a,b) => {
        return a.timeToUpload - b.timeToUpload;
    });
    const applicantList = applicantSorted.map((applicant) => {
            // console.log(applicant)
            return(
                <div>
                    <ListGroup.Item><strong>{applicant.username}</strong>

                    {   applicant.attachment ?
                        <div>
                            {applicant.timeToUpload <= 3600 ?
                                <Button
                                    variant = "primary"
                                    style={{outline: "none"}}
                                    onClick={() => downloadFile(applicant.username)}>
                                    {applicant.fileName}
                                </Button> :
                                <Button
                                    variant = "danger"
                                    style={{outline: "none"}}
                                    onClick={() => downloadFile(applicant.username)}>
                                    {applicant.fileName}
                                </Button>
                            } 
                            {parseUploadTime(applicant.timeToUpload)}
                        </div> : 
                        <div>
                            no file submitted
                        </div>
                    }
                    </ListGroup.Item>
                </div>
            )
    })

    return (
        <div>
            <ListGroup>
                {applicantList}
            </ListGroup>
        </div>
    )
} 

export default ApplicantList;
