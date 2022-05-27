import React, { Component, useState, useEffect, useCallback} from 'react'
import {useNavigate} from 'react-router-dom'
import PropTypes from 'prop-types'
import axios from "axios";
//import { GET_ERRORS } from "./types";
import {Container, Card,Form,Button,Col,Modal} from "react-bootstrap"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSave,faPlusSquare,faUndo} from "@fortawesome/free-solid-svg-icons"
import {Link} from "react-router-dom"

const RegistrationForm = (props) => {

    let navigate = useNavigate();
    const initialState = {
        fullname:"",
        email:"",
        password:"",
        password_confirmation:"",
        registrationSuccess:false,
        redirect: false,
        goToRegistration: false,
        errors: {fullname: "",
                 email: "",
                password: "",
                password_confirmation: ""} 

    }

    const [state, setState] = useState({
        fullname: "",
        email: props.username,
        password: "",
        password_confirmation: "",
        registrationSuccess: false,
        redirect: false,
        goToRegistration: false,
        errors: {fullname: "",
                 email: "",
                password: "",
                password_confirmation: ""} 

    })

    useEffect(() => {
        console.log("useEffect state", state);
        if(state.registrationSuccess)
            navigate("/registration_success", {state:{email:state.email}});
    })
    const handleChange = (e) => {
        const {id , value} = e.target
        //console.log("handleChange triggered", e);
        // console.log(id, value);
        setState(prevState => ({
            ...prevState,
            [id] : value
        }))


        //console.log(state);
    }
    //...
    const onKeyDown = (event) => {
        if(event.key === 'Enter') handleSubmit(event);

    }

    function resetUser() {
        setState(() => initialState)
    }
    const resetErrors=() => {
        //console.log("Reset Errors", state);
        setState(prevState => ({
            ...prevState,
            errors: initialState.errors
        }))
    }
    const createNewUser = async(newUser) => {
        //console.log("new user:", newUser);
        await axios.post("/auth/register", newUser)
        .then(response => {
            //console.log("response", response.data)
            props.onHide();
            setState(prevState => ({
                ...prevState, registrationSuccess: true}));
            console.log("Registration successful");
        })
        .catch(err => {
            console.log("Top level error", err.response);
            // console.log(JSON.stringify(err.response.data));
            
            if(err.response.data.confirmPassword) {
                let errors = state.errors;
                errors.confirmPassword = err.response.data.confirmPassword;
                setState(prevState => ({
                    ...prevState,
                    errors: state.errors
                }))
                
            } else if(err.response.data.password) {
                let errors = state.errors;
                errors.password = err.response.data.password;
                setState(prevState => ({
                    ...prevState,
                    errors: state.errors
                }))
            }
            else
            {
                console.log("Caught error", err.response.data.message);
                if(err.response.data.message === (state.email + " already exists!")) {
                    //user exists, redirect to login dialog
                    console.log("redirect to login");

                    props.redirectToLogin(state.email);
                    
                
                }
            }
        });
    }

    function handleSubmit(event) {
        
        // console.log("HandleSubmit", state);
        event.preventDefault();

        try{
            const user= {
                id: null,
                name: state.fullname,
                username: state.email,
                password: state.password,
                confirmPassword: state.password_confirmation
            };
            resetErrors();
            createNewUser(user);
            //console.log("Form submitted?");
        } catch(error) {
            console.log(error);
        }
    }
    function redirectToLogin() {

    }
    const userChange = (event) =>{
        setState({
            [event.target.name]:event.target.value
        })

    };


    const {fullname,
        email,
        password,
        password_confirmation,
        registrationSuccess,
        redirect,
        goToRegistration,
        errors
    } = state;
    //console.log("state", state)
    return(
        <div>
        
        <Card className={"border border-dark bg-dark text-white"}>
            <Form onReset={resetUser} onSubmit={handleSubmit} id="userFormId">
            <Card.Body>
            <Form.Group as= {Col} controlId="fullname">
            <Form.Label>Name</Form.Label>
            <Form.Control required autoComplete="off"
            type="text"
            name="fullname"
            value={fullname}
            onChange={handleChange}
            onKeyDown={onKeyDown}
            className={"bg-light"}
        
            placeholder="Enter Full Name" />

            </Form.Group>

            <Form.Group as= {Col} controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control required autoComplete="off"
            type="email"
            name="email"
            value={email}
            onChange={handleChange}
            onKeyDown={onKeyDown}
            isInvalid={!!errors.email}
            className={"bg-light"}
            placeholder="Enter Email (Username)" />
            <Form.Control.Feedback type="invalid">
                {errors.email}
            </Form.Control.Feedback>
            </Form.Group>

            <Form.Group as= {Col} controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control required autoComplete="off"
            type="password"
            name="password"
            value={password}
            onChange={handleChange}
            onKeyDown={onKeyDown}
            isInvalid={!!errors.password}
            className={"bg-light"}
            placeholder="Enter Password" />
            <Form.Control.Feedback type="invalid">
                {errors.password}
            </Form.Control.Feedback>
            </Form.Group>

            <Form.Group as= {Col} controlId="password_confirmation">
            <Form.Label>Password</Form.Label>
            <Form.Control required autoComplete="off"
            type="password"
            name="password_confirmation"
            value={password_confirmation}
            onChange={handleChange}
            onKeyDown={onKeyDown}
            isInvalid={!!errors.confirmPassword}
            className={"bg-light"}
            placeholder="Re-enter Password" />
        <Form.Control.Feedback type="invalid">
                {errors.confirmPassword}
            </Form.Control.Feedback>    
            </Form.Group>

            <Card.Footer style={{"textAlign":"center"}}>
            <Container class="fluid">
                <div class="row">
                    <div class="btn-group-sm btn-group-horizontal">
                    <Button size="sm" variant="primary" class="customWidth" type="submit">

                    <FontAwesomeIcon icon={faSave} />Submit
                    </Button>{" "}
                    <Button size="sm" variant="primary" class="customWidth" type="reset">
                    <FontAwesomeIcon icon={faUndo} />Reset
                    </Button>
                    </div>
                </div>
            </Container>
            </Card.Footer>
            </Card.Body>
            </Form>
        </Card>
        </div>
    );
        
}

//RegistrationForm.propTypes = {
//  //createNewUser: PropTypes.func.isRequired,
//  errors: PropTypes.object.isRequired
//};

const mapStateToProps = state => ({
  errors: state.errors
});

export default RegistrationForm;