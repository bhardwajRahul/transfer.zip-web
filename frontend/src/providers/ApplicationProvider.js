import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { Outlet } from "react-router-dom"
import Modal from "../components/elements/Modal";
import WaitlistModal from "../components/elements/modals/WaitlistModal";

export const ApplicationContext = createContext({})

export const ApplicationProvider = () => {

    const [showWaitlistModal, setShowWaitlistModal] = useState(false)

    const [showGenericModal, setShowGenericModal] = useState(false)
    const [genericModalProps, setGenericModalProps] = useState(null)
    const displayGenericModal = (props) => {
        if (props === false) {
            return setShowGenericModal(false)
        }
        setGenericModalProps(props)
        setShowGenericModal(true)
    }

    const displayErrorModal = (description) => {
        displayGenericModal({
            title: "Error...", style: "danger", buttons: [{ title: "Ok!", onClick: () => displayGenericModal(false) }],
            children: <p className="text-sm text-gray-500">{description}</p>
        })
    }

    const displaySuccessModal = (title, description) => {
        displayGenericModal({
            title, style: "success", buttons: [{ title: "Ok!", onClick: () => displayGenericModal(false) }],
            children: <p className="text-sm text-gray-500">{description}</p>
        })
    }

    return (
        <ApplicationContext.Provider value={{
            setShowWaitlistModal,
            displayGenericModal,
            displayErrorModal,
            displaySuccessModal
        }}>
            <Modal show={showGenericModal} onClose={() => setShowGenericModal(false)} {...genericModalProps} />
            <WaitlistModal show={showWaitlistModal} />
            <Outlet />
        </ApplicationContext.Provider >
    );
};