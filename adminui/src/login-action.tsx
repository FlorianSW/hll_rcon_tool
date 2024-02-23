import {Box, Button, Form, FormField, Input, Modal, SpaceBetween} from '@cloudscape-design/components';
import React, {forwardRef, useImperativeHandle, useState} from 'react';
import {useServices} from "./di";

interface LoginActionProps {
    onLoggedIn?: () => void;
}

export interface LoginActionRef {
    show: () => void,
}

export default forwardRef(function LoginAction({onLoggedIn}: LoginActionProps, ref) {
    const {notifications, userinfoService} =useServices();
    const [visible, setVisible] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useImperativeHandle(ref, () => ({
        show: () => {
            setSubmitting(false);
            setPassword('');
            setVisible(true);
        },
    } as LoginActionRef));

    function submit() {
        setSubmitting(true);
        notifications.connectTo(userinfoService.logIn(username, password))
            .subscribe({
                next: () => {
                    setSubmitting(false);
                    setVisible(false);
                    notifications.success('Logged in successfully');
                    if (onLoggedIn) {
                        onLoggedIn();
                    }
                },
                error: (e: any) => {
                    setSubmitting(false);
                    notifications.error('An error occurred while logging you in. Please try again. Error: ' + e.toString())
                }
            });
    }

    return (
        <Modal
            visible={visible}
            onDismiss={() => setVisible(false)}
            header="Login"
            footer={<Box float="right">
                <SpaceBetween direction="horizontal" size="xs">
                    <Button variant="link" disabled={submitting} onClick={() => setVisible(false)}>Cancel</Button>
                    <Button variant="primary" loading={submitting}
                            disabled={password === '' || username === '' || submitting}
                            onClick={submit}>Login</Button>
                </SpaceBetween>
            </Box>}
        >
            <Form>
                <FormField label="Username">
                    <Input value={username} onChange={(d) => setUsername(d.detail.value)}></Input>
                </FormField>
                <FormField label="Password">
                    <Input value={password} type='password' onChange={(d) => setPassword(d.detail.value)}></Input>
                </FormField>
            </Form>
        </Modal>
    );
});
