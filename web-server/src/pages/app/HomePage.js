import { Link, useNavigate } from "react-router-dom";
import AppGenericPage from "../../components/app/AppGenericPage";
import StatCard from "../../components/app/StatCard";
import { useContext, useEffect, useState } from "react";
import { ApplicationContext } from "../../providers/ApplicationProvider";
import { AuthContext } from "../../providers/AuthProvider";
import { groupStatisticsByInterval, humanFileSize, humanFileSizePair } from "../../utils";
import StorageStatCard from "../../components/app/statcards/StorageStatCard";
import { Pie, PieChart, ResponsiveContainer } from "recharts";
import GraphCard from "../../components/app/GraphCard";
import * as Api from "../../api/Api"
import InlineFooter from "../../components/app/InlineFooter";
import { Helmet } from "react-helmet";

export default function HomePage({ }) {

    const { apiTransfers, hasFetched, newApiTransferAndNavigate } = useContext(ApplicationContext)
    const { user } = useContext(AuthContext)

    const navigate = useNavigate()

    const [statistics, setStatistics] = useState([])

    const getDownloadsCount = (interval) => {
        const grouped = groupStatisticsByInterval(statistics, interval)
        return grouped.reduce((prev, curr) => prev + curr.value, 0)
    }

    const updateStatistics = async (fromDate) => {
        const res = await Api.getAllStatistics(0)
        setStatistics(res.statistics)
    }

    const getFilesCount = () => {
        if (!hasFetched) {
            return 0
        }
        let files = 0
        apiTransfers.forEach(x => {
            files += x.files.length
        })
        return files
    }

    const getTransfersCount = () => {
        return apiTransfers.length
    }

    // useEffect(() => {
    //     if (user && user.plan == "free") {
    //         navigate("/app/quick-share", { replace: true })
    //     }
    // }, [user])

    useEffect(() => {
        updateStatistics()
    }, [])

    return (
        <AppGenericPage requireAuth={true} title={"Dashboard"} className={"HomePage"}>
            <div className="d-flex flex-column gap-3">
                <div className="d-flex flex-row flex-wrap gap-3 order-1">
                    <StatCard
                        title={"Transfers"}
                        stat={getTransfersCount()}
                        subtitle={"active now"}
                    >
                        <Link to="/app/transfers" style={{ textDecoration: "none" }}>View transfers<i className="bi bi-arrow-right-short"></i></Link>
                    </StatCard>
                    <StatCard
                        title={"Files"}
                        stat={getFilesCount()}
                        subtitle={"in storage"}
                    >
                        <Link to="/files" style={{ textDecoration: "none" }}>View files<i className="bi bi-arrow-right-short"></i></Link>
                    </StatCard>
                    <StatCard
                        title={"Downloads"}
                        stat={getDownloadsCount("week")}
                        subtitle={"last week"}
                    // subtitle={"in total"}
                    >
                        <Link to="/statistics" style={{ textDecoration: "none" }}>View stats<i className="bi bi-arrow-right-short"></i></Link>
                    </StatCard>
                    <StorageStatCard />
                </div>
                <div className="d-flex flex-row flex-wrap gap-3 order-0 order-sm-2">
                    {/* <div className="bg-body rounded p-5 border" style={{ maxWidth: "300px" }}>
                    </div> */}
                    <button onClick={() => navigate("/app/quick-share")} className="btn bg-body border rounded-4 p-3 flex-grow-1 flex-md-grow-0">
                        <div className="text-start d-flex flex-column">
                            <span className="text-primary-emphasis">Quick Share<i className="bi bi-arrow-right-short"></i></span>
                            <small><span className="text-body-secondary">Share files as long as browser is open, <b>no size limit</b>.</span></small>
                        </div>
                    </button>
                    <button onClick={newApiTransferAndNavigate} className="btn bg-body border rounded-4 p-3 flex-grow-1 flex-md-grow-0">
                        <div className="text-start d-flex flex-column">
                            <span className="text-primary-emphasis">Transfer<i className="bi bi-arrow-right-short"></i></span>
                            <small><span className="text-body-secondary">Upload files and share them, <b>stored permanently</b>.</span></small>
                        </div>
                    </button>
                </div>
            </div>
        </AppGenericPage>
    )
}