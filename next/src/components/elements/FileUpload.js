"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import BIcon from "../BIcon"
import Link from 'next/link'
import { Transition } from "@headlessui/react"
import { humanFileSize, humanFileType } from "@/lib/transferUtils"
import { humanFileName } from "@/lib/utils"

import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { PopoverClose } from "@radix-ui/react-popover"

export default function FileUpload({ initialFiles, onFilesChange, onFiles, onReceiveClicked, progressElement, showProgress, buttonText, singleFile, disabled, accept, headless, children }) {

  const _buttonText = buttonText ?? "Transfer"

  const [files, setFiles] = useState(initialFiles || [])

  const fileInputRef = useRef()
  const folderInputRef = useRef()

  const [error, setError] = useState(null)

  const handleFileInputChange = (e) => {
    const newFiles = [...files, ...e.target.files]

    const names = new Set()

    try {
      const relPaths = new Set()
      for (const file of newFiles) {
        if (file.webkitRelativePath && file.webkitRelativePath.length > 0) {
          if (relPaths.has(file.webkitRelativePath)) {
            throw new Error(file.webkitRelativePath)
          }
          relPaths.add(file.webkitRelativePath)
        } else {
          if (names.has(file.name)) {
            throw new Error(file.name)
          }
          names.add(file.name)
        }
      }
    }
    catch (err) {
      setError(
        <>
          <p>
            We can't send multiple files with the same name! Try again.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            <span className="font-medium">Name:</span> <span className="font-mono break-all">{err.message}</span>
          </p>
        </>
      )
      return
    }

    setFiles(newFiles)
    onFilesChange && onFilesChange(newFiles)
  }

  const handlePickFiles = e => {
    e.preventDefault()
    e.stopPropagation()
    fileInputRef.current.click()
  }

  const handleSelectFolder = e => {
    e.preventDefault()
    e.stopPropagation()
    folderInputRef.current.click()
  }

  const totalFileSize = useMemo(() => {
    return files.reduce((total, file) => total + file.size, 0);
  }, [files]);

  const removeFile = file => {
    setFiles(files.filter(otherFile => otherFile !== file))
  }

  const handleTransferClicked = e => {
    onFiles(files)
  }

  const [compact, setCompact] = useState(false)

  const divRef = useRef()

  useEffect(() => {
    if (!divRef.current) return

    const handleResize = entries => {
      setCompact(entries[0].contentRect.width < 330)
    }

    setCompact(divRef.current.offsetWidth < 330)

    const resizeObserver = new window.ResizeObserver(handleResize)
    resizeObserver.observe(divRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <>
      <form style={{ display: "none" }}>
        <input ref={fileInputRef} onChange={handleFileInputChange} type="file" aria-hidden="true" multiple={singleFile ? undefined : true} accept={accept}></input>
        <input ref={folderInputRef} onChange={handleFileInputChange} type="file" aria-hidden="true" webkitdirectory="true"></input>
      </form>
      <Popover open={!!error} onOpenChange={open => setError(!!open)}>
        <PopoverAnchor>
          <div></div>
        </PopoverAnchor>
        <PopoverContent className={"relative"}>
          <PopoverClose asChild>
            <button className="absolute right-4"><BIcon name={"x-lg"} center /></button>
          </PopoverClose>
          <div className="pe-5">
            <p className="font-semibold text-gray-800">Whoops!</p>
          </div>
          <div className="text-gray-600 mt-1">
            {error}
          </div>
        </PopoverContent>
      </Popover>
      <div ref={divRef} className={`text-start relative w-full flex flex-col min-h-56 ${headless ? "" : "rounded-2xl bg-white border shadow-lg"} ${onReceiveClicked ? "mt-8" : ""}`}>
        {onReceiveClicked && (
          <div className="absolute w-full flex">
            <button type="button" onClick={onReceiveClicked} className="text-sm font-medium text-gray-500 relative mx-auto bg-white border py-1 px-10 rounded-t-lg transition-all h-7 -top-7 hover:h-8 hover:-top-8 hover:text-primary">
              <BIcon name={"file-earmark-arrow-down"} /> Receive files
            </button>
          </div>
        )}
        <Transition show={files.length == 0}>
          <div type="button" onClick={handlePickFiles} className="absolute left-0 top-0 w-full h-full flex flex-col justify-center items-center group transition data-[closed]:opacity-0 hover:cursor-pointer">
            <div className="text-white rounded-full bg-primary w-12 h-12 flex group-hover:bg-primary-light">
              <BIcon name={"plus"} center className={"flex-grow text-3xl"} />
            </div>
            <span className="font-medium mt-2 text-lg">{singleFile ? "Pick a file" : "Pick files"}</span>
            {!singleFile && (
              <button onClick={handleSelectFolder} className="text-gray-500 text-sm font-medium mt-2 underline hover:text-primary">
                or select a folder
              </button>
            )}
          </div>
        </Transition>
        <Transition show={files.length > 0}>
          <div className="grow flex flex-col p-4 transition data-[closed]:opacity-0 gap-4">
            <div className="grow max-h-56 overflow-auto">
              {files.map((file) => {
                return (
                  <div className="relative px-2 py-1 overflow-hidden text-md group" key={file.webkitRelativePath + file.name + file.size + file.lastModified}>
                    <div className="absolute right-0 hidden group-hover:block pe-2">
                      <button type="button" onClick={() => removeFile(file)} className="bg-white border p-1 rounded-lg"><BIcon name={"x"} center /></button>
                    </div>
                    <p className="text-nowrap">{humanFileName(file.name)}</p>
                    <span className="text-sm text-gray-500">{humanFileSize(file.size, true)}<BIcon name={"dot"} />{humanFileType(file.type)}</span>
                  </div>
                )
              })}
            </div>
            <div className="w-full flex justify-between">
              <div className="flex gap-2">
                {!singleFile && <>
                  <button type="button" className="text-sm pe-3 px-2 rounded-lg border shadow hover:bg-gray-100" onClick={handlePickFiles}><BIcon name={"plus"} /> Files</button>
                  <button type="button" className="text-sm px-2 rounded-lg border shadow hover:bg-gray-100" onClick={handleSelectFolder}><BIcon name={"folder-plus"} />{!compact && " Folder"}</button>
                </>}
              </div>
              <div>
                <span className="text-gray-500 text-sm me-2 hidden sm:inline">{humanFileSize(totalFileSize, true)}</span>
                <button disabled={disabled} type="button" onClick={handleTransferClicked} className="text-white px-2 py-1 rounded-lg shadow bg-primary hover:bg-primary-light disabled:bg-primary-lighter">{_buttonText} &rarr;</button>
              </div>
            </div>
          </div>
        </Transition>
        <Transition show={showProgress || false}>
          <div className="rounded-2xl bg-white absolute left-0 top-0 w-full h-full p-8 flex flex-row justify-center items-center group transition data-[closed]:opacity-0">
            <div className="relative w-full h-full max-w-44 max-h-44">
              {progressElement}
            </div>
          </div>
        </Transition>
      </div>
    </>
  )
}