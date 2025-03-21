import { useContext, useMemo, useRef, useState } from "react"
import { DashboardContext } from "../../../routes/dashboard/Dashboard"
import { DialogTitle } from "@headlessui/react"
import BIcon from "../../BIcon"
import { tryCopyToClipboard } from "../../../utils"
import { ApplicationContext } from "../../../providers/ApplicationProvider"
import { deleteTransfer, getTransferDownloadLink, putTransfer, sendTransferByEmail } from "../../../Api"
import { useRevalidator } from "react-router-dom"
import { humanFileSize } from "../../../transferUtils"
import { AuthContext } from "../../../providers/AuthProvider"
import Modal from "../../elements/Modal"

export default function TransferSidebar({ }) {

  const revalidator = useRevalidator()

  const { user } = useContext(AuthContext)
  const { displayNotification, displayErrorModal } = useContext(ApplicationContext)
  const { selectedTransfer, hideSidebar } = useContext(DashboardContext)
  const [showEmailList, setShowEmailList] = useState(false)

  const transferLink = useMemo(() => getTransferDownloadLink(selectedTransfer), [selectedTransfer])

  const emailRef = useRef(null)

  const textarea = useMemo(() => {
    return (
      <textarea
        key={Math.random()}
        id="description"
        name="description"
        rows={4}
        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
        defaultValue={selectedTransfer?.description}
      />
    )
  }, [selectedTransfer])

  const nameInput = useMemo(() => {
    return (
      <input
        key={Math.random()}
        defaultValue={selectedTransfer?.hasName ? selectedTransfer.name : undefined}
        placeholder={selectedTransfer?.hasName ? "" : "Untitled Transfer"}
        id="name"
        name="name"
        type="text"
        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
      />
    )
  }, [selectedTransfer])

  if (!selectedTransfer) {
    return <></>
  }

  const handleClose = () => {
    hideSidebar()
  }

  const handleCopy = async e => {
    if (await tryCopyToClipboard(transferLink)) {
      displayNotification("Copied Link", "The Transfer link was successfully copied to the clipboard!")
    }
  }

  const handleSendByEmail = async e => {
    if (user.plan == "starter" && selectedTransfer.emailsSharedWith.length >= 25) {
      displayErrorModal("With the Starter plan, you can only send a file transfer to up to 25 email recipients at once. Upgrade to Pro to send up to 200 emails per transfer.")
      return
    }
    if (user.plan == "pro" && selectedTransfer.emailsSharedWith.length >= 200) {
      displayErrorModal("With the Pro plan, you can only send a file transfer to up to 200 email recipients at once.")
      return
    }

    const email = emailRef.current.value
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(email)) {
      return
    }

    await sendTransferByEmail(selectedTransfer.id, [email])

    displayNotification("Email sent", `The Transfer link was successfully sent to ${email}!`)
    emailRef.current.value = ""
    revalidator.revalidate()
  }

  const handleSubmit = async e => {
    e.preventDefault()

    const formData = new FormData(e.target)

    const name = formData.get("name")
    const description = formData.get("description")

    await putTransfer(selectedTransfer.id, { name, description })

    displayNotification("Transfer Updated", "The information has been saved!")

    revalidator.revalidate()
  }

  const handleDelete = async e => {
    await deleteTransfer(selectedTransfer.id)
    hideSidebar()
    revalidator.revalidate()
  }

  const handleLinkKeyDown = async e => {
    if (e.key === "Enter") {
      handleCopy()
      e.preventDefault()
    }
  }

  const handleEmailKeyDown = async e => {
    if (e.key === "Enter") {
      handleSendByEmail()
      e.preventDefault()
    }
  }

  const handleShowEmailList = e => {
    setShowEmailList(true)
  }

  return (
    <>
      <Modal title={`Shared with ${selectedTransfer.emailsSharedWith.length} people`} icon={"envelope"} buttons={[
        { title: "Ok", onClick: () => setShowEmailList(false) }
      ]} show={showEmailList} onClose={() => setShowEmailList(false)}>
        {/* <p className="text-sm font-medium mb-1"></p> */}
        <ul className="text-start text-sm text-gray-600 list-inside list-disc min-w-60">
          {selectedTransfer.emailsSharedWith.map((entry, index) => <li key={index}>{entry.email}</li>)}
        </ul>
      </Modal>
      <form onSubmit={handleSubmit} className="md:border-s flex h-full flex-col divide-y divide-gray-200 bg-white">
        <div className="h-0 flex-1 overflow-y-auto">
          <div className="bg-primary px-4 py-6 sm:px-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold leading-6 text-white">{selectedTransfer.name}</h2>
              <div className="ml-3 flex h-7 items-center">
                <button
                  type="button"
                  onClick={handleClose}
                  className="relative rounded-md bg-primary text-primary-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <span className="absolute -inset-2.5" />
                  <span className="sr-only">Close panel</span>
                  <BIcon center name={"x-lg"} aria-hidden="true" className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="mt-1">
              <p className="text-sm text-primary-300">
                Edit and view information about your transfer.
              </p>
            </div>
          </div>
          <div className="flex flex-1 flex-col justify-between">
            <div className="divide-y divide-gray-200 px-4 sm:px-6">
              <div className="space-y-6 pb-5 pt-6">
                <div>
                  {/* <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                  Link
                </label> */}
                  <div className="relative mt-2 flex items-center">
                    <input
                      onKeyDown={handleLinkKeyDown}
                      type="url"
                      className="block w-full border-0 py-2.5 ps-4 pr-28 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                      value={transferLink}
                      readOnly
                    />
                    <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
                      <button type="button" onClick={handleCopy} className="inline-flex items-center rounded border border-gray-200 px-1 pe-1.5 font-sans text-xs text-primary font-medium bg-white hover:bg-gray-50">
                        <BIcon name={"copy"} className={"mr-1 ms-1"} />Copy Link
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="relative mt-2 flex items-center">
                    <input
                      onKeyDown={handleEmailKeyDown}
                      ref={emailRef}
                      type="email"
                      className="block w-full border-0 py-2.5 ps-4 pr-28 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                      // value={transferLink}
                      placeholder="user@example.com"
                    />
                    <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
                      <button type="button" onClick={handleSendByEmail} className="inline-flex items-center rounded border border-gray-200 px-1 pe-1.5 font-sans text-xs text-primary font-medium bg-white hover:bg-gray-50">
                        <BIcon name={"send"} className={"mr-1 ms-1"} />Send Email
                      </button>
                    </div>
                  </div>
                  {selectedTransfer.emailsSharedWith && selectedTransfer.emailsSharedWith.length > 0 && (
                    <div className="mt-2 text-xs text-gray-600">
                      Last shared with {selectedTransfer.emailsSharedWith[selectedTransfer.emailsSharedWith.length - 1].email}{" "}
                      {selectedTransfer.emailsSharedWith.length > 1 && <a href="#" className="text-primary hover:underline" onClick={handleShowEmailList}>and {selectedTransfer.emailsSharedWith.length - 1} more</a>}
                    </div>
                  )}
                </div>
                {/* <hr /> */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                    Name
                  </label>
                  <div className="mt-2">
                    {nameInput}
                  </div>
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
                    Message
                  </label>
                  <div className="mt-2">
                    {textarea}
                  </div>
                </div>
              </div>
              <div className="pb-6 pt-4">
                {selectedTransfer.files.length > 0 &&
                  <div className="mb-2">
                    <span><i className="bi bi-file-earmark me-1"></i>{selectedTransfer.files.length} File{selectedTransfer.files.length > 1 ? "s" : ""}</span>
                    <p className="text-gray-600">{humanFileSize(selectedTransfer.size, true)}</p>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-shrink-0 justify-end px-4 py-4">
          <button
            type="button"
            onClick={handleDelete}
            className="text-red-500 hover:text-red-400 mr-auto"
          >
            <BIcon
              name={"trash"}
              aria-hidden="true"
              className=""
            />
            <span className="ms-2">Delete</span>
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="ml-4 inline-flex justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Save
          </button>
        </div>
      </form>
    </>
  )
}