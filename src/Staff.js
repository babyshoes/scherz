import React, { Component } from 'react';
import { drawStaff } from './viz/staff'
import './App.css';

export default class Staff extends Component {   
    
    componentDidMount() {
        drawStaff(this.props)
    };

    componentDidUpdate() {
        drawStaff(this.props)
    };

    render(){ 
        return (
            <div id="staff-viz"/>
        );
    }
  }
