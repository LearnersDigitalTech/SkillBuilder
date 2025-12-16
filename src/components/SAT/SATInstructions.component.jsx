import React from 'react';
import Styles from './SATInstructions.module.css';
import { Clock, BookOpen, Calculator, CheckCircle, Brain, Play, LogOut } from 'lucide-react';

const SATInstructions = ({ onStart, onExit }) => {
    return (
        <div className={Styles.container}>
            <div className={Styles.card}>
                <div className={Styles.header}>
                    <h1 className={Styles.title}>SAT Practice Test</h1>
                    <p className={Styles.subtitle}>Prepare for success with our adaptive practice mode</p>
                </div>

                <div className={Styles.content}>
                    <div className={Styles.instructionSection}>
                        <h2 className={Styles.instructionTitle}>
                            <Brain size={24} color="#2563eb" />
                            Before you begin
                        </h2>
                        <ul className={Styles.list}>
                            <li className={Styles.listItem}>
                                <div className={Styles.iconWrapper}><Clock size={20} /></div>
                                <div>
                                    <strong>Time Management:</strong> This is a self-paced practice session. Take your time to understand each problem.
                                </div>
                            </li>
                            <li className={Styles.listItem}>
                                <div className={Styles.iconWrapper}><BookOpen size={20} /></div>
                                <div>
                                    <strong>Comprehensive Coverage:</strong> Questions cover Algebra, Advanced Math, Problem Solving, and Data Analysis.
                                </div>
                            </li>
                            <li className={Styles.listItem}>
                                <div className={Styles.iconWrapper}><Calculator size={20} /></div>
                                <div>
                                    <strong>Tools Allowed:</strong> You may use a calculator for all math sections in this digital practice.
                                </div>
                            </li>
                            <li className={Styles.listItem}>
                                <div className={Styles.iconWrapper}><CheckCircle size={20} /></div>
                                <div>
                                    <strong>No Penalty for Guessing:</strong> There are no points deducted for incorrect answers. Attempt every question.
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className={Styles.footer}>
                    <button className={`${Styles.button} ${Styles.secondaryButton}`} onClick={onExit}>
                        <LogOut size={18} />
                        Exit
                    </button>
                    <button className={`${Styles.button} ${Styles.primaryButton}`} onClick={onStart}>
                        Start Exam
                        <Play size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SATInstructions;
