import React, { Component, useState} from 'react'
import PropTypes from 'prop-types'
//import Input from '../Input'
import {useHistory} from 'react-router';
import {Card,Form,Button,Col, Alert} from "react-bootstrap"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSave,faPlusSquare,faUndo} from "@fortawesome/free-solid-svg-icons"
import {authenticationService as auth} from '../Services/authenticationService'


import Cookies from 'universal-cookie';
import {nameService as nameSvc} from '../Services/nameService'
const LoginForm = (props) => {

    //...
    const [state, setState] = useState({
        email: props.username,
        password: "",
        show: false,
        loginFail: false,
        verificationError: false
    })

    const initialState = {
        email: props.username,
        password: "",
        show: false,
        loginFail: false,
        verificationError: false

    }

    function resetUser() {
        setState(() => initialState);
    }
    const handleChange = (e) => {
        const {id , value} = e.target   
        setState(prevState => ({
            ...prevState,
            [id] : value
        }))
    }
    const onKeyDown = (event) => {
        if(event.key === 'Enter') handleSubmit();

    }
    async function resendVerificationEmail() {
        const promise = await auth.resendVerificationEmail(this.state.email, this.state.password);
        
        this.setState({verificationError: false});
    }

    async function handleSubmit() {
        const promise = await auth.login(state.email, state.password)
        console.log("Loginform", auth.loggedIn);
        console.log(promise);
        if(auth.loggedIn) {
            nameSvc.setName(promise.name);
            nameSvc.setRole(promise.roles[0]);
            
            setState({loginFail: false});;
            props.onHide();
            
        }
        else {
            
            if(auth.verificationError) {
                setState(prevState => ({...prevState, verificationError: true}))
            }
            else setState(prevState => ({...prevState, password: "", loginFail: true}));
        }
    }
    return(
        <div>
        <Card className={"border border-dark bg-dark text-white"}>
            <Form onReset={resetUser} id="userFormId">
            <Card.Header>

            </Card.Header>
            <Card.Body>



            <Form.Group as= {Col} controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control required autoComplete="off"
            type="email"
            name="email"
            value={state.email}
            onChange={handleChange}
            onKeyDown={onKeyDown}
            className={"bg-light"}
            placeholder="Enter Email" />
            </Form.Group>

            <Form.Group as= {Col} controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control required autoComplete="off"
            type="password"
            name="password"
            value={state.password}
            onChange={handleChange}
            onKeyDown={onKeyDown}
            className={"bg-light"}
            placeholder="Enter Password" />
            
            </Form.Group>

            <Card.Footer style={{"textAlign":"right"}}>
            {state.loginFail ? <Alert key='danger'> Invalid Credentials </Alert> : <div/>}
            {state.verificationError ?
                <div> 
                <Alert key='info'>
                    Verification Failed, send new confirmation link?
                    <Button size="sm" variant="secondary" onClick={resendVerificationEmail}>
                        Resend Email
                    </Button>
                </Alert>
                </div> : <div/>
            }
            <Button size="sm" variant="primary" onClick={handleSubmit}>
            <FontAwesomeIcon icon={faSave} />Submit
            </Button>{" "}
            </Card.Footer>
            </Card.Body>
            </Form>
        </Card>
        </div>
    	);


}



export default LoginForm;