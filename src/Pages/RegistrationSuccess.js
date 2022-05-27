import React, { Component, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Container } from 'react-bootstrap';
import {Card} from "react-bootstrap";
import { Navigate, useLocation} from 'react-router-dom'

const RegistrationSuccess = () => {



    const location = useLocation();
    console.log(location);
    const [redirect, setRedirect] = useState(false);
    function openDlg() {
        setRedirect(true);
    }

    if(redirect) {

        return <Navigate to="/"/>
    }
    else {
        return (
            <div>

            <Container>
            <div class = "row">
                <div class = "col text-center">
                    Sign-up successful, please check email sent to <b>{location.state.email}</b> to finish registration process..
                </div>
            </div>
            <div class = "row">
                <div class = "col text-center">
                    <Button className={"btn-primary center"} onClick={openDlg}> Proceed </Button>
                </div>
            </div>
            </Container>

            </div>
        );
    }
    
}
export default RegistrationSuccess;