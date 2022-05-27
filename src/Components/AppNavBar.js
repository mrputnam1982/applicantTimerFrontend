import React, {useEffect, useMemo, useState} from 'react';
import {Link} from 'react-router-dom';
import {Navbar, Nav, NavbarBrand, Dropdown, Button} from 'react-bootstrap';
import {authenticationService as auth} from '../Services/authenticationService';
import {nameService as nameSvc} from '../Services/nameService';
import {authHeader} from '../Helpers/authHeader';
import axios from 'axios';
import { ignoreElements } from 'rxjs';
const AppNavBar = (props) => {
    
    const [admin, setAdmin] = useState(false);
    const [name, setName] = useState(localStorage.getItem('name'));
    useEffect(() => {

        localStorage.setItem('name', name);
        const subscription = nameSvc.currentName.subscribe((name) => {
            console.log("Current Name", name);
            if(typeof name !== 'undefined') {
                console.log("Setting name", name);
                setName(name);
            }
            if(auth.loggedIn) {
                isAdminRole();
                console.log("admin?", admin);
            }
        })

        return () => {
            if(subscription) {
                subscription.unsubscribe();
            }
        }
    }, [name])

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
    console.log("rerender AppNavBar");
    return (
        <div>
            <Navbar color="light" expand="md" className="px-2">
                <NavbarBrand>
                    Applicant Timer App
                </NavbarBrand>
                <Nav className="ms-auto" style={{marginRight: "20px"}}>
                    <Dropdown className="px-20">
                        {auth.loggedIn ? 
                            <Dropdown.Toggle variant="success"> 
                                Welcome, {name} 
                            </Dropdown.Toggle> :
                            <Dropdown.Toggle variant="success">
                                Welcome, Guest
                            </Dropdown.Toggle>
                       } 
                                                
                        <Dropdown.Menu>
                            {
                            auth.loggedIn ?
                                (props.fileDownloaded || admin) ?
                                    <Dropdown.Item onClick={props.uploadFile}>
                                        Upload File
                                    </Dropdown.Item> :
                                    <Dropdown.Item >
                                        <Link 
                                            to="/files/Interview.pptx" 
                                            target="_blank" 
                                            onClick={props.downloadFile}
                                            download>
                                            Download File
                                        </Link>
                                    </Dropdown.Item>
                                 :
                                <div/> 
                            }

                            {auth.loggedIn ?
                                <div/> :
                                <div>
                                    <Dropdown.Item onClick={props.openRegistrationForm}>
                                        Register
                                    </Dropdown.Item>
                                </div>
                            }
                            {(admin && auth.loggedIn)  ?
                                <div>
                                    <Dropdown.Item onClick={props.gotoApplicantList}>
                                        View Applicant Status
                                    </Dropdown.Item>
                                </div> :
                                <div/>
                            }
                            {auth.loggedIn ?
                                <Dropdown.Item onClick={props.logout}>
                                    Logout
                                </Dropdown.Item> :
                                <Dropdown.Item onClick={props.login}>
                                    Login
                                </Dropdown.Item>
                            }
                        </Dropdown.Menu>
                    </Dropdown>
                </Nav>
            </Navbar>
        </div>
    )
}

export default AppNavBar;