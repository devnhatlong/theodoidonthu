import { Modal } from 'antd'
import React from 'react'

const ModalComponent = ({title = 'Modal', isOpen = false, children, ...rests}) => {
    return (
        <Modal width={1200} title={title} open={isOpen} {...rests}>
            {children}
        </Modal>
    )
}

export default ModalComponent