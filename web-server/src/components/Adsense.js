import { useContext, useEffect } from "react"
import { isSelfHosted } from "../utils"
import { AuthContext } from "../providers/AuthProvider"

export default function Adsense({ data_ad_client, data_ad_slot, className, staticAd, width, height }) {
    let ads = (process.env.REACT_APP_ADSENSE && process.env.REACT_APP_ADSENSE == "true")

    useEffect(() => {
        if(!ads) {
            return
        }

        const scriptElement = window.document.createElement("script")
        scriptElement.async = true
        scriptElement.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + data_ad_client
        scriptElement.crossorigin = "anonymous"

        document.body.appendChild(scriptElement)

        // (window.adsbygoogle = window.adsbygoogle || []).push({}); // dont uncomment this, it breaks appendChild for some fucking reason (i fucking hate programming)

        return () => {
            document.body.removeChild(scriptElement)
        }
    }, [])

    useEffect(() => {
        if(!ads) return;
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
        catch {

        }
    }, [])

    if(!ads) return <></>

    return (
        staticAd ? (
            <ins className={"adsbygoogle " + className}
            style={{ display: "inline-block", width, height }}
            data-ad-client={data_ad_client}
            data-ad-slot={data_ad_slot}></ins>
        ) : (
            <ins className={"adsbygoogle " + className}
            style={{ display: "block" }}
            data-ad-client={data_ad_client}
            data-ad-slot={data_ad_slot}
            data-ad-format="auto"
            data-full-width-responsive="true"></ins>
        )
    )
}