import { useLocation, useNavigate } from "react-router-dom";
import FileUpload from "../../components/elements/FileUpload";
import { useContext } from "react";
import { QuickShareContext } from "../QuickSharePage";

export default function QuickShareNew({ }) {
  const { hasBeenSentLink, k, remoteSessionId, transferDirection } = useContext(QuickShareContext)

  const navigate = useNavigate()

  const handleFiles = (files) => {

    if (hasBeenSentLink) {
      navigate("progress", {
        state: {
          files,
          // These fields are prepopulated from link
          k, remoteSessionId, transferDirection
        }
      })
    }
    else {
      navigate("progress", {
        state: {
          files,
          transferDirection: "S"
        }
      })
    }
  }

  const onReceiveClicked = e => {
    navigate("progress", {
      state: {
        transferDirection: "R"
      }
    })
  }

  return (
    <div className="w-full max-w-96 text-center">
      <div className={hasBeenSentLink ? "mb-2" : "mb-28"}>
        <h1 className="font-bold text-4xl md:text-5xl mb-2">{hasBeenSentLink ? "Send Files" : "Quick Share"}</h1>
        <h2 className="text-gray-800 mb-4 md:text-lg">
          {hasBeenSentLink ?
            "Someone has requested you to send files!"
            :
            "Send files in realtime, with no size limit."
          }
        </h2>
      </div>
      <FileUpload onFiles={handleFiles} onReceiveClicked={hasBeenSentLink ? undefined : onReceiveClicked} />
      <p className="text-gray-500 text-xs mt-2">
        We do not use cookies. Your files are protected with end-to-end encryption, meaning they remain unreadable by anyone but you.
      </p>
    </div>
  )
}