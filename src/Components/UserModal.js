import React, {useState, useEffect} from 'react';
import { Modal, Button } from 'react-bootstrap';
import {authenticationService as auth} from '../Services/authenticationService';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {FaSignInAlt, FaPlusSquare } from "react-icons/fa";
import LoginForm from './LoginForm';
import RegistrationForm from './RegistrationForm';

const UserModal = (props) => {

    const [displayLogin, toggleDisplayLogin] = useState(false);
    const [username, setUsername] = useState(props.username);

    useEffect(() => {
 
            toggleDisplayLogin(props.displayLogin)
            setUsername(props.username);
            console.log("UseEffect called");

    })  

    
    const redirectToLogin = (username) => {

        props.redirect(username);
        console.log("redirect to Login Form called");
    }
    return(
        <Modal show={props.show} onHide={props.onHide}>
                <Modal.Header closeButton>
                  <Modal.Title>{displayLogin ?
                        <div> <FaSignInAlt/> SignIn </div>
                        : <div> <FaPlusSquare /> Register </div>}
                </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {displayLogin ? <LoginForm 
                        username={username}
                        onHide = {props.onHide}/> :
                    <RegistrationForm 
                        redirectToLogin={redirectToLogin}
                        onHide = {props.onHide}/>
                    }
                </Modal.Body>

        </Modal> );
}

export default UserModal;