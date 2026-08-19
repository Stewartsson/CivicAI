// ============================================================
// CIVICAI
// script.js
// Version 8.0.0
// ============================================================


// ============================================================
// FASTAPI BACKEND
// ============================================================

const API_URL =
    "http://127.0.0.1:8000";


// ============================================================
// CHENNAI DEFAULT LOCATION
// ============================================================

const CHENNAI = [
    13.0827,
    80.2707
];


// ============================================================
// GLOBAL VARIABLES
// ============================================================

let complaints = [];

let filteredComplaints = [];

let complaintMap = null;

let mapMarkers = [];

let mapCoordinates = new Map();

let mapUserMoved = false;

let mapUpdateRunning = false;

let markerClusterGroup = null;


// ============================================================
// DOM ELEMENTS
// ============================================================

const complaintForm =
    document.getElementById(
        "complaintForm"
    );


const submitMessage =
    document.getElementById(
        "submitMessage"
    );


const complaintsContainer =
    document.getElementById(
        "complaintsContainer"
    );


const noComplaints =
    document.getElementById(
        "noComplaints"
    );


const resultsCount =
    document.getElementById(
        "resultsCount"
    );


const searchInput =
    document.getElementById(
        "searchInput"
    );


const categoryFilter =
    document.getElementById(
        "categoryFilter"
    );


const severityFilter =
    document.getElementById(
        "severityFilter"
    );


const priorityFilter =
    document.getElementById(
        "priorityFilter"
    );


const statusFilter =
    document.getElementById(
        "statusFilter"
    );


const sortFilter =
    document.getElementById(
        "sortFilter"
    );


const clearFilters =
    document.getElementById(
        "clearFilters"
    );


const detailsModal =
    document.getElementById(
        "detailsModal"
    );


const modalContent =
    document.getElementById(
        "modalContent"
    );


const closeModal =
    document.getElementById(
        "closeModal"
    );


const modalCloseButton =
    document.getElementById(
        "modalCloseButton"
    );


const mapStatus =
    document.getElementById(
        "mapStatus"
    );


const fitMapBtn =
    document.getElementById(
        "fitMapBtn"
    );


// ============================================================
// PAGE START
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "CivicAI frontend starting..."
        );


        initializeMap();


        await loadComplaints();


        console.log(
            "CivicAI frontend ready."
        );

    }
);


// ============================================================
// INITIALISE MAP
// ============================================================

function initializeMap() {

    if (!window.L) {

        console.error(
            "Leaflet is not loaded."
        );


        if (mapStatus) {

            mapStatus.textContent =
                "❌ Leaflet could not be loaded.";

        }

        return;
    }


    const mapElement =
        document.getElementById(
            "complaintMap"
        );


    if (!mapElement) {

        console.error(
            "complaintMap element not found."
        );

        return;
    }


    try {

        complaintMap =
            L.map(
                mapElement,
                {
                    center:
                        CHENNAI,

                    zoom:
                        12,

                    zoomControl:
                        true,

                    dragging:
                        true,

                    scrollWheelZoom:
                        true,

                    doubleClickZoom:
                        true,

                    boxZoom:
                        true,

                    keyboard:
                        true,

                    touchZoom:
                        true
                }
            );


        // ====================================================
        // OPENSTREETMAP
        // ====================================================

        L.tileLayer(
            "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            {

                maxZoom:
                    19,

                minZoom:
                    3,

                attribution:
                    "&copy; OpenStreetMap contributors"

            }
        ).addTo(
            complaintMap
        );


        // ====================================================
        // MARKER CLUSTER
        // ====================================================

        if (
            window.L &&
            window.L.markerClusterGroup
        ) {

            markerClusterGroup =
                L.markerClusterGroup(
                    {

                        showCoverageOnHover:
                            false,

                        zoomToBoundsOnClick:
                            true,

                        spiderfyOnMaxZoom:
                            true,

                        removeOutsideVisibleBounds:
                            false,

                        maxClusterRadius:
                            50

                    }
                );


            complaintMap.addLayer(
                markerClusterGroup
            );

        }


        // ====================================================
        // MAP MOVEMENT
        // ====================================================

        complaintMap.on(
            "dragstart",
            () => {

                mapUserMoved =
                    true;

            }
        );


        complaintMap.on(
            "zoomstart",
            () => {

                mapUserMoved =
                    true;

            }
        );


        if (mapStatus) {

            mapStatus.textContent =
                "🗺️ Map ready";

        }


        // ====================================================
        // FIX MAP SIZE
        // ====================================================

        setTimeout(
            () => {

                if (complaintMap) {

                    complaintMap.invalidateSize(
                        true
                    );

                }

            },
            300
        );


        setTimeout(
            () => {

                if (complaintMap) {

                    complaintMap.invalidateSize(
                        true
                    );

                }

            },
            1000
        );

    }
    catch (error) {

        console.error(
            "Map initialization error:",
            error
        );


        if (mapStatus) {

            mapStatus.textContent =
                "❌ Unable to initialise map.";

        }

    }

}


// ============================================================
// LOAD COMPLAINTS
// ============================================================

async function loadComplaints() {

    try {

        console.log(
            "Loading complaints..."
        );


        const response =
            await fetch(
                `${API_URL}/complaints`,
                {
                    method:
                        "GET",

                    headers:
                        {
                            "Accept":
                                "application/json"
                        }
                }
            );


        if (!response.ok) {

            throw new Error(
                `Unable to fetch complaints (${response.status})`
            );

        }


        const data =
            await response.json();


        if (!Array.isArray(data)) {

            throw new Error(
                "Invalid complaint data received."
            );

        }


        complaints =
            data;


        filteredComplaints =
            [
                ...complaints
            ];


        console.log(
            "Complaints loaded:",
            complaints
        );


        updateDashboard();


        updateAnalytics();


        applyFilters();


    }
    catch (error) {

        console.error(
            "Load complaints error:",
            error
        );


        complaints =
            [];


        filteredComplaints =
            [];


        updateDashboard();


        updateAnalytics();


        if (complaintsContainer) {

            complaintsContainer.innerHTML = `

                <div class="no-complaints">

                    ❌ Unable to load complaints.

                    <br><br>

                    Make sure FastAPI is running at:

                    <br><br>

                    <strong>
                        ${escapeHTML(API_URL)}
                    </strong>

                </div>

            `;

        }


        if (mapStatus) {

            mapStatus.textContent =
                "❌ Unable to load complaint locations";

        }

    }

}


// ============================================================
// SUBMIT COMPLAINT
// ============================================================

if (complaintForm) {

    complaintForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const title =
                document
                    .getElementById(
                        "title"
                    )
                    ?.value
                    .trim() ||
                "";


            const description =
                document
                    .getElementById(
                        "description"
                    )
                    ?.value
                    .trim() ||
                "";


            const category =
                document
                    .getElementById(
                        "category"
                    )
                    ?.value ||
                "Other";


            const location =
                document
                    .getElementById(
                        "location"
                    )
                    ?.value
                    .trim() ||
                "";


            if (
                !title ||
                !description ||
                !location
            ) {

                showMessage(
                    "❌ Please fill all required fields.",
                    "error"
                );


                return;

            }


            try {

                showMessage(
                    "⏳ Submitting complaint...",
                    "info"
                );


                const response =
                    await fetch(
                        `${API_URL}/complaints`,
                        {

                            method:
                                "POST",

                            headers:
                                {
                                    "Content-Type":
                                        "application/json",

                                    "Accept":
                                        "application/json"
                                },

                            body:
                                JSON.stringify(
                                    {

                                        title:
                                            title,

                                        description:
                                            description,

                                        category:
                                            category,

                                        location:
                                            location

                                    }
                                )

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.detail ||
                        "Complaint submission failed."
                    );

                }


                showMessage(
                    `

                    <div>

                        ✅ Complaint submitted successfully!

                        <br><br>

                        🆔 Complaint ID:

                        <strong>
                            ${escapeHTML(
                                data.complaint_id
                            )}
                        </strong>

                        <br>

                        🤖 AI Category:

                        <strong>
                            ${escapeHTML(
                                data.ai_category ||
                                data.category ||
                                "Other"
                            )}
                        </strong>

                        <br>

                        ⚠️ Severity:

                        <strong>
                            ${escapeHTML(
                                data.severity ||
                                data.ai_severity ||
                                "Medium"
                            )}
                        </strong>

                        <br>

                        🚨 Priority:

                        <strong>
                            ${escapeHTML(
                                data.priority ||
                                data.ai_priority ||
                                "Important"
                            )}
                        </strong>

                    </div>

                    `,
                    "success"
                );


                complaintForm.reset();


                mapUserMoved =
                    false;


                mapCoordinates.clear();


                await loadComplaints();


                setTimeout(
                    () => {

                        const section =
                            document.querySelector(
                                ".complaints-section"
                            );


                        if (section) {

                            section.scrollIntoView(
                                {
                                    behavior:
                                        "smooth"
                                }
                            );

                        }

                    },
                    300
                );

            }
            catch (error) {

                console.error(
                    "Submit complaint error:",
                    error
                );


                showMessage(
                    `

                    ❌ Failed to submit complaint.

                    <br><br>

                    ${escapeHTML(
                        error.message
                    )}

                    `,
                    "error"
                );

            }

        }
    );

}


// ============================================================
// MESSAGE
// ============================================================

function showMessage(
    message,
    type
) {

    if (!submitMessage) {

        return;

    }


    submitMessage.innerHTML =
        message;


    if (
        type === "success"
    ) {

        submitMessage.style.color =
            "#087f5b";

    }
    else if (
        type === "error"
    ) {

        submitMessage.style.color =
            "#c62828";

    }
    else {

        submitMessage.style.color =
            "#00695c";

    }

}


// ============================================================
// DASHBOARD
// ============================================================

function updateDashboard() {

    setText(
        "totalCount",
        complaints.length
    );


    setText(
        "highCount",
        complaints.filter(
            c =>
                String(
                    c.severity
                ) ===
                "High"
        ).length
    );


    setText(
        "urgentCount",
        complaints.filter(
            c =>
                String(
                    c.priority
                ) ===
                "Urgent"
        ).length
    );


    setText(
        "pendingCount",
        complaints.filter(
            c =>
                String(
                    c.status
                ) ===
                "Pending"
        ).length
    );


    setText(
        "progressCount",
        complaints.filter(
            c =>
                String(
                    c.status
                ) ===
                "In Progress"
        ).length
    );


    setText(
        "resolvedCount",
        complaints.filter(
            c =>
                String(
                    c.status
                ) ===
                "Resolved"
        ).length
    );

}


// ============================================================
// SET TEXT
// ============================================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value;

    }

}


// ============================================================
// ANALYTICS
// ============================================================

function updateAnalytics() {

    renderAnalytics(
        "categoryAnalytics",

        [
            "Garbage",
            "Pothole",
            "Drainage",
            "Streetlight",
            "Water",
            "Other"
        ],

        "category",

        getCategoryEmoji,

        () =>
            "category-bar"
    );


    renderAnalytics(
        "severityAnalytics",

        [
            "Low",
            "Medium",
            "High"
        ],

        "severity",

        getSeverityEmoji,

        name =>
            `${name.toLowerCase()}-bar`
    );


    renderAnalytics(
        "priorityAnalytics",

        [
            "Normal",
            "Important",
            "Urgent"
        ],

        "priority",

        getPriorityEmoji,

        name =>
            `${name.toLowerCase()}-bar`
    );


    renderAnalytics(
        "statusAnalytics",

        [
            "Pending",
            "In Progress",
            "Resolved"
        ],

        "status",

        getStatusEmoji,

        name =>
            name ===
            "In Progress"
                ? "progress-status-bar"
                : `${name.toLowerCase()}-bar`
    );

}


// ============================================================
// RENDER ANALYTICS
// ============================================================

function renderAnalytics(
    containerId,
    names,
    field,
    emojiFunction,
    barFunction
) {

    const container =
        document.getElementById(
            containerId
        );


    if (!container) {

        return;

    }


    const counts =
        names.map(
            name => ({

                name:

                    name,

                count:

                    complaints.filter(
                        c =>
                            String(
                                c[field]
                            ) ===
                            String(name)
                    ).length

            })
        );


    const max =
        Math.max(
            ...counts.map(
                x =>
                    x.count
            ),
            1
        );


    container.innerHTML =
        counts
            .map(
                item => `

                    <div class="analytics-row">

                        <div class="analytics-label">

                            <span>

                                ${emojiFunction(
                                    item.name
                                )}

                                ${escapeHTML(
                                    item.name
                                )}

                            </span>

                            <span>
                                ${item.count}
                            </span>

                        </div>


                        <div
                            class="progress-background"
                        >

                            <div
                                class="
                                    progress-bar
                                    ${barFunction(
                                        item.name
                                    )}
                                "
                                style="
                                    width:
                                    ${
                                        (
                                            item.count /
                                            max
                                        ) *
                                        100
                                    }%
                                "
                            ></div>

                        </div>

                    </div>

                `
            )
            .join("");

}


// ============================================================
// FILTERS
// ============================================================

function applyFilters() {

    if (
        !searchInput ||
        !categoryFilter ||
        !severityFilter ||
        !priorityFilter ||
        !statusFilter ||
        !sortFilter
    ) {

        return;

    }


    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    const category =
        categoryFilter.value;


    const severity =
        severityFilter.value;


    const priority =
        priorityFilter.value;


    const status =
        statusFilter.value;


    filteredComplaints =
        complaints.filter(
            complaint => {

                const text = `

                    ${complaint.title || ""}

                    ${complaint.description || ""}

                    ${complaint.location || ""}

                    ${complaint.category || ""}

                    ${complaint.severity || ""}

                    ${complaint.priority || ""}

                    ${complaint.status || ""}

                `.toLowerCase();


                return (

                    (
                        !search ||
                        text.includes(
                            search
                        )
                    )

                    &&

                    (
                        category ===
                            "All" ||

                        complaint.category ===
                            category
                    )

                    &&

                    (
                        severity ===
                            "All" ||

                        complaint.severity ===
                            severity
                    )

                    &&

                    (
                        priority ===
                            "All" ||

                        complaint.priority ===
                            priority
                    )

                    &&

                    (
                        status ===
                            "All" ||

                        complaint.status ===
                            status
                    )

                );

            }
        );


    sortComplaints(
        sortFilter.value
    );


    displayComplaints();


    updateComplaintMap(
        filteredComplaints
    );

}


// ============================================================
// SORTING
// ============================================================

function sortComplaints(
    type
) {

    const severityRank = {

        Low:
            1,

        Medium:
            2,

        High:
            3

    };


    const priorityRank = {

        Normal:
            1,

        Important:
            2,

        Urgent:
            3

    };


    switch (type) {


        case "newest":

            filteredComplaints.sort(
                (a, b) =>
                    Number(
                        b.id
                    ) -
                    Number(
                        a.id
                    )
            );

            break;


        case "oldest":

            filteredComplaints.sort(
                (a, b) =>
                    Number(
                        a.id
                    ) -
                    Number(
                        b.id
                    )
            );

            break;


        case "severity-high":

            filteredComplaints.sort(
                (a, b) =>
                    (
                        severityRank[
                            b.severity
                        ] ||
                        0
                    )
                    -
                    (
                        severityRank[
                            a.severity
                        ] ||
                        0
                    )
            );

            break;


        case "severity-low":

            filteredComplaints.sort(
                (a, b) =>
                    (
                        severityRank[
                            a.severity
                        ] ||
                        0
                    )
                    -
                    (
                        severityRank[
                            b.severity
                        ] ||
                        0
                    )
            );

            break;


        case "priority-high":

            filteredComplaints.sort(
                (a, b) =>
                    (
                        priorityRank[
                            b.priority
                        ] ||
                        0
                    )
                    -
                    (
                        priorityRank[
                            a.priority
                        ] ||
                        0
                    )
            );

            break;


        case "priority-low":

            filteredComplaints.sort(
                (a, b) =>
                    (
                        priorityRank[
                            a.priority
                        ] ||
                        0
                    )
                    -
                    (
                        priorityRank[
                            b.priority
                        ] ||
                        0
                    )
            );

            break;


        case "title-az":

            filteredComplaints.sort(
                (a, b) =>
                    String(
                        a.title ||
                        ""
                    ).localeCompare(
                        String(
                            b.title ||
                            ""
                        )
                    )
            );

            break;


        case "title-za":

            filteredComplaints.sort(
                (a, b) =>
                    String(
                        b.title ||
                        ""
                    ).localeCompare(
                        String(
                            a.title ||
                            ""
                        )
                    )
            );

            break;

    }

}


// ============================================================
// DISPLAY COMPLAINTS
// ============================================================

function displayComplaints() {

    if (!complaintsContainer) {

        return;

    }


    complaintsContainer.innerHTML =
        "";


    if (resultsCount) {

        resultsCount.textContent =
            filteredComplaints.length;

    }


    if (
        filteredComplaints.length ===
        0
    ) {

        if (noComplaints) {

            noComplaints.style.display =
                "block";

        }

        return;

    }


    if (noComplaints) {

        noComplaints.style.display =
            "none";

    }


    complaintsContainer.innerHTML =
        filteredComplaints
            .map(
                createComplaintCard
            )
            .join("");

}


// ============================================================
// CREATE COMPLAINT CARD
// ============================================================

function createComplaintCard(
    c
) {

    const severityClass =
        `severity-${
            String(
                c.severity ||
                "Low"
            ).toLowerCase()
        }`;


    const priorityClass =
        `priority-${
            String(
                c.priority ||
                "Normal"
            ).toLowerCase()
        }`;


    return `

        <div class="complaint-card">


            <h3 class="complaint-title">

                ${escapeHTML(
                    c.title
                )}

            </h3>


            <p class="description">

                <span class="info-label">
                    Description:
                </span>

                ${escapeHTML(
                    c.description
                )}

            </p>


            <div class="info-row">

                🤖

                <span class="info-label">
                    AI Category:
                </span>

                ${escapeHTML(
                    c.category
                )}

            </div>


            <div class="info-row">

                ⚠️

                <span class="info-label">
                    Severity:
                </span>

                <span
                    class="
                        badge
                        ${severityClass}
                    "
                >

                    ${escapeHTML(
                        c.severity
                    )}

                </span>

            </div>


            <div class="info-row">

                🚨

                <span class="info-label">
                    Priority:
                </span>

                <span
                    class="
                        badge
                        ${priorityClass}
                    "
                >

                    ${escapeHTML(
                        c.priority
                    )}

                </span>

            </div>


            <div class="info-row">

                📍

                <span class="info-label">
                    Location:
                </span>

                ${escapeHTML(
                    c.location
                )}

            </div>


            <div class="status-box">

                <label>
                    📌 Complaint Status
                </label>


                <select
                    class="status-select"
                    onchange="
                        updateComplaintStatus(
                            ${Number(c.id)},
                            this.value
                        )
                    "
                >


                    <option
                        value="Pending"
                        ${
                            c.status ===
                            "Pending"
                                ? "selected"
                                : ""
                        }
                    >
                        🟡 Pending
                    </option>


                    <option
                        value="In Progress"
                        ${
                            c.status ===
                            "In Progress"
                                ? "selected"
                                : ""
                        }
                    >
                        🔵 In Progress
                    </option>


                    <option
                        value="Resolved"
                        ${
                            c.status ===
                            "Resolved"
                                ? "selected"
                                : ""
                        }
                    >
                        🟢 Resolved
                    </option>


                </select>

            </div>


            <div class="card-buttons">

                <button
                    class="view-btn"
                    type="button"
                    onclick="
                        showComplaintDetails(
                            ${Number(c.id)}
                        )
                    "
                >

                    👁️ View Details

                </button>

            </div>


            <div class="info-row">

                🆔

                <span class="info-label">
                    ID:
                </span>

                ${Number(c.id)}

            </div>


        </div>

    `;

}


// ============================================================
// UPDATE STATUS
// ============================================================

async function updateComplaintStatus(
    id,
    newStatus
) {

    try {

        const response =
            await fetch(
                `${API_URL}/complaints/${id}/status`,
                {

                    method:
                        "PUT",

                    headers:
                        {
                            "Content-Type":
                                "application/json",

                            "Accept":
                                "application/json"
                        },

                    body:
                        JSON.stringify(
                            {
                                status:
                                    newStatus
                            }
                        )

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Status update failed."
            );

        }


        const complaint =
            complaints.find(
                c =>
                    Number(
                        c.id
                    ) ===
                    Number(
                        id
                    )
            );


        if (complaint) {

            complaint.status =
                data.status ||
                newStatus;


            complaint.updated_at =
                data.updated_at ||
                complaint.updated_at;

        }


        updateDashboard();


        updateAnalytics();


        applyFilters();


        alert(
            `✅ Complaint #${id} status updated to "${newStatus}"`
        );

    }
    catch (error) {

        console.error(
            "Status update error:",
            error
        );


        alert(
            "❌ Unable to update complaint status.\n\n" +
            error.message
        );


        await loadComplaints();

    }

}


// ============================================================
// MAP
// ============================================================

async function updateComplaintMap(
    items
) {

    if (!complaintMap) {

        return;

    }


    if (mapUpdateRunning) {

        return;

    }


    mapUpdateRunning =
        true;


    try {

        clearMapMarkers();


        if (
            !items.length
        ) {

            complaintMap.setView(
                CHENNAI,
                12
            );


            if (mapStatus) {

                mapStatus.textContent =
                    "🗺️ No complaints match the current filters";

            }


            return;

        }


        if (mapStatus) {

            mapStatus.textContent =
                "🗺️ Locating complaints...";

        }


        const positions = [];


        for (
            const complaint
            of items
        ) {

            const position =
                await getComplaintCoordinates(
                    complaint
                );


            if (
                position &&
                position.length ===
                    2
            ) {

                addComplaintMarker(
                    complaint,
                    position
                );


                positions.push(
                    position
                );

            }

        }


        if (
            positions.length
        ) {

            if (!mapUserMoved) {

                fitMapToPositions(
                    positions
                );

            }


            if (mapStatus) {

                mapStatus.textContent =
                    `🗺️ Showing ${positions.length} ` +
                    `complaint${
                        positions.length ===
                        1
                            ? ""
                            : "s"
                    } on the map`;

            }

        }
        else {

            if (mapStatus) {

                mapStatus.textContent =
                    "🗺️ No valid complaint locations found";

            }

        }

    }
    catch (error) {

        console.error(
            "Map update error:",
            error
        );


        if (mapStatus) {

            mapStatus.textContent =
                "❌ Unable to display complaint locations";

        }

    }
    finally {

        mapUpdateRunning =
            false;

    }

}


// ============================================================
// CLEAR MARKERS
// ============================================================

function clearMapMarkers() {

    if (!complaintMap) {

        return;

    }


    if (
        markerClusterGroup
    ) {

        markerClusterGroup.clearLayers();

    }


    else {

        mapMarkers.forEach(
            marker => {

                try {

                    complaintMap.removeLayer(
                        marker
                    );

                }
                catch (
                    error
                ) {

                    console.warn(
                        "Marker removal error:",
                        error
                    );

                }

            }
        );

    }


    mapMarkers =
        [];

}


// ============================================================
// GET COORDINATES
// ============================================================

async function getComplaintCoordinates(
    complaint
) {

    const id =
        Number(
            complaint.id
        );


    const latitude =
        Number(
            complaint.latitude
        );


    const longitude =
        Number(
            complaint.longitude
        );


    // ========================================================
    // DATABASE COORDINATES
    // ========================================================

    if (

        Number.isFinite(
            latitude
        )

        &&

        Number.isFinite(
            longitude
        )

        &&

        latitude >=
            -90

        &&

        latitude <=
            90

        &&

        longitude >=
            -180

        &&

        longitude <=
            180

    ) {

        const position =
            [
                latitude,
                longitude
            ];


        mapCoordinates.set(
            id,
            position
        );


        return position;

    }


    // ========================================================
    // CACHE
    // ========================================================

    if (
        mapCoordinates.has(
            id
        )
    ) {

        return mapCoordinates.get(
            id
        );

    }


    // ========================================================
    // NOMINATIM
    // ========================================================

    const location =
        String(
            complaint.location ||
            ""
        ).trim();


    if (location) {

        try {

            const query =
                `${location}, Chennai, India`;


            const url =
                "https://nominatim.openstreetmap.org/search" +
                "?format=jsonv2" +
                "&limit=1" +
                "&countrycodes=in" +
                "&q=" +
                encodeURIComponent(
                    query
                );


            const response =
                await fetch(
                    url,
                    {

                        method:
                            "GET",

                        headers:
                            {
                                "Accept":
                                    "application/json"
                            }

                    }
                );


            if (
                response.ok
            ) {

                const data =
                    await response.json();


                if (
                    Array.isArray(
                        data
                    ) &&
                    data.length >
                        0
                ) {

                    const lat =
                        Number(
                            data[0].lat
                        );


                    const lon =
                        Number(
                            data[0].lon
                        );


                    if (
                        Number.isFinite(
                            lat
                        ) &&
                        Number.isFinite(
                            lon
                        )
                    ) {

                        const position =
                            [
                                lat,
                                lon
                            ];


                        mapCoordinates.set(
                            id,
                            position
                        );


                        return position;

                    }

                }

            }

        }
        catch (error) {

            console.warn(
                "Nominatim error:",
                error
            );

        }

    }


    // ========================================================
    // FALLBACK
    // ========================================================

    const row =
        (
            id -
            1
        ) % 5;


    const column =
        Math.floor(
            (
                (
                    id -
                    1
                ) % 25
            ) / 5
        );


    const fallbackPosition =
        [

            CHENNAI[0] +
            (
                (
                    row -
                    2
                ) *
                0.01
            ),

            CHENNAI[1] +
            (
                (
                    column -
                    2
                ) *
                0.01
            )

        ];


    mapCoordinates.set(
        id,
        fallbackPosition
    );


    return fallbackPosition;

}


// ============================================================
// ADD MAP MARKER
// ============================================================

function addComplaintMarker(
    complaint,
    position
) {

    if (
        !complaintMap ||
        !position
    ) {

        return;

    }


    const color =
        getSeverityColor(
            complaint.severity
        );


    const marker =
        L.circleMarker(
            position,
            {

                radius:
                    10,

                fillColor:
                    color,

                color:
                    "#ffffff",

                weight:
                    3,

                opacity:
                    1,

                fillOpacity:
                    0.95

            }
        );


    // ========================================================
    // POPUP
    // ========================================================

    marker.bindPopup(
        `

        <div
            style="
                min-width:240px;
            "
        >

            <h3
                style="
                    margin-top:0;
                    color:#00695c;
                "
            >
                ${escapeHTML(
                    complaint.title
                )}
            </h3>


            <p>

                <strong>
                    🆔 ID:
                </strong>

                #${Number(
                    complaint.id
                )}

            </p>


            <p>

                <strong>
                    🤖 Category:
                </strong>

                ${escapeHTML(
                    complaint.category
                )}

            </p>


            <p>

                <strong>
                    ⚠️ Severity:
                </strong>

                ${escapeHTML(
                    complaint.severity
                )}

            </p>


            <p>

                <strong>
                    🚨 Priority:
                </strong>

                ${escapeHTML(
                    complaint.priority
                )}

            </p>


            <p>

                <strong>
                    📌 Status:
                </strong>

                ${getStatusEmoji(
                    complaint.status
                )}

                ${escapeHTML(
                    complaint.status
                )}

            </p>


            <p>

                <strong>
                    📍 Location:
                </strong>

                ${escapeHTML(
                    complaint.location
                )}

            </p>


            <button
                type="button"
                onclick="
                    showComplaintDetails(
                        ${Number(
                            complaint.id
                        )}
                    )
                "
                style="
                    width:100%;
                    padding:9px;
                    background:#007f73;
                    color:white;
                    border:none;
                    border-radius:6px;
                    cursor:pointer;
                    font-weight:bold;
                "
            >

                👁️ View Details

            </button>


        </div>

        `
    );


    // ========================================================
    // ADD TO CLUSTER
    // ========================================================

    if (
        markerClusterGroup
    ) {

        markerClusterGroup.addLayer(
            marker
        );

    }
    else {

        marker.addTo(
            complaintMap
        );

    }


    mapMarkers.push(
        marker
    );

}


// ============================================================
// FIT MAP
// ============================================================

function fitMapToPositions(
    positions
) {

    if (
        !complaintMap ||
        !positions.length
    ) {

        return;

    }


    try {

        if (
            positions.length ===
            1
        ) {

            complaintMap.setView(
                positions[0],
                14
            );


            return;

        }


        const bounds =
            L.latLngBounds(
                positions
            );


        if (
            bounds.isValid()
        ) {

            complaintMap.fitBounds(
                bounds.pad(
                    0.15
                )
            );

        }

    }
    catch (error) {

        console.error(
            "Fit map error:",
            error
        );

    }

}


// ============================================================
// FIT MAP BUTTON
// ============================================================

if (fitMapBtn) {

    fitMapBtn.addEventListener(
        "click",
        () => {

            mapUserMoved =
                false;


            if (
                filteredComplaints.length
            ) {

                const positions =
                    mapMarkers.map(
                        marker =>
                            marker.getLatLng()
                    );


                if (
                    positions.length
                ) {

                    fitMapToPositions(
                        positions
                    );

                }

            }

        }
    );

}


// ============================================================
// SHOW COMPLAINT DETAILS
// ============================================================

function showComplaintDetails(
    id
) {

    const complaint =
        complaints.find(
            c =>
                Number(
                    c.id
                ) ===
                Number(
                    id
                )
        );


    if (!complaint) {

        alert(
            "Complaint not found."
        );


        return;

    }


    if (!modalContent) {

        return;

    }


    const severityClass =
        `severity-${
            String(
                complaint.severity ||
                "Low"
            ).toLowerCase()
        }`;


    const priorityClass =
        `priority-${
            String(
                complaint.priority ||
                "Normal"
            ).toLowerCase()
        }`;


    modalContent.innerHTML =
        `

        <h2 class="modal-title">

            📋

            ${escapeHTML(
                complaint.title
            )}

        </h2>


        <div>

            🆔 Complaint ID:

            <strong>
                #${Number(
                    complaint.id
                )}
            </strong>

        </div>


        <div
            class="modal-description"
        >

            <strong>
                📄 Description
            </strong>

            <br><br>

            ${escapeHTML(
                complaint.description
            )}

        </div>


        <div
            class="modal-info-grid"
        >


            <div class="modal-info">

                <span
                    class="modal-info-label"
                >
                    🤖 AI Category
                </span>

                <span
                    class="modal-info-value"
                >
                    ${escapeHTML(
                        complaint.category
                    )}
                </span>

            </div>


            <div class="modal-info">

                <span
                    class="modal-info-label"
                >
                    ⚠️ Severity
                </span>

                <span
                    class="
                        modal-info-value
                        badge
                        ${severityClass}
                    "
                >
                    ${escapeHTML(
                        complaint.severity
                    )}
                </span>

            </div>


            <div class="modal-info">

                <span
                    class="modal-info-label"
                >
                    🚨 Priority
                </span>

                <span
                    class="
                        modal-info-value
                        badge
                        ${priorityClass}
                    "
                >
                    ${escapeHTML(
                        complaint.priority
                    )}
                </span>

            </div>


            <div class="modal-info">

                <span
                    class="modal-info-label"
                >
                    📍 Location
                </span>

                <span
                    class="modal-info-value"
                >
                    ${escapeHTML(
                        complaint.location
                    )}
                </span>

            </div>


            <div class="modal-info">

                <span
                    class="modal-info-label"
                >
                    📌 Status
                </span>

                <span
                    class="modal-info-value"
                >

                    ${getStatusEmoji(
                        complaint.status
                    )}

                    ${escapeHTML(
                        complaint.status
                    )}

                </span>

            </div>


            <div class="modal-info">

                <span
                    class="modal-info-label"
                >
                    📅 Created
                </span>

                <span
                    class="modal-info-value"
                >
                    ${escapeHTML(
                        formatDate(
                            complaint.created_at
                        )
                    )}
                </span>

            </div>


            <div class="modal-info">

                <span
                    class="modal-info-label"
                >
                    🔄 Updated
                </span>

                <span
                    class="modal-info-value"
                >
                    ${escapeHTML(
                        formatDate(
                            complaint.updated_at
                        )
                    )}
                </span>

            </div>


        </div>

        `;


    detailsModal.style.display =
        "flex";


    document.body.style.overflow =
        "hidden";

}


// ============================================================
// CLOSE MODAL
// ============================================================

function closeDetailsModal() {

    if (detailsModal) {

        detailsModal.style.display =
            "none";

    }


    document.body.style.overflow =
        "";

}


if (closeModal) {

    closeModal.addEventListener(
        "click",
        closeDetailsModal
    );

}


if (modalCloseButton) {

    modalCloseButton.addEventListener(
        "click",
        closeDetailsModal
    );

}


if (detailsModal) {

    detailsModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                detailsModal
            ) {

                closeDetailsModal();

            }

        }
    );

}


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Escape"
        ) {

            closeDetailsModal();

        }

    }
);


// ============================================================
// FILTER EVENTS
// ============================================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        applyFilters
    );

}


if (categoryFilter) {

    categoryFilter.addEventListener(
        "change",
        applyFilters
    );

}


if (severityFilter) {

    severityFilter.addEventListener(
        "change",
        applyFilters
    );

}


if (priorityFilter) {

    priorityFilter.addEventListener(
        "change",
        applyFilters
    );

}


if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        applyFilters
    );

}


if (sortFilter) {

    sortFilter.addEventListener(
        "change",
        applyFilters
    );

}


// ============================================================
// CLEAR FILTERS
// ============================================================

if (clearFilters) {

    clearFilters.addEventListener(
        "click",
        () => {

            if (searchInput) {

                searchInput.value =
                    "";

            }


            if (categoryFilter) {

                categoryFilter.value =
                    "All";

            }


            if (severityFilter) {

                severityFilter.value =
                    "All";

            }


            if (priorityFilter) {

                priorityFilter.value =
                    "All";

            }


            if (statusFilter) {

                statusFilter.value =
                    "All";

            }


            if (sortFilter) {

                sortFilter.value =
                    "newest";

            }


            mapUserMoved =
                false;


            applyFilters();

        }
    );

}


// ============================================================
// SEVERITY COLOUR
// ============================================================

function getSeverityColor(
    severity
) {

    const value =
        String(
            severity ||
            ""
        ).toLowerCase();


    if (
        value ===
        "high"
    ) {

        return "#e0525a";

    }


    if (
        value ===
        "medium"
    ) {

        return "#edbd3e";

    }


    return "#4dcc8b";

}


// ============================================================
// CATEGORY EMOJI
// ============================================================

function getCategoryEmoji(
    category
) {

    const emojis = {

        Garbage:
            "🗑️",

        Pothole:
            "🕳️",

        Drainage:
            "🌊",

        Streetlight:
            "💡",

        Water:
            "💧",

        Other:
            "📌"

    };


    return (
        emojis[
            category
        ] ||
        "📌"
    );

}


// ============================================================
// SEVERITY EMOJI
// ============================================================

function getSeverityEmoji(
    severity
) {

    const emojis = {

        Low:
            "🟢",

        Medium:
            "🟡",

        High:
            "🔴"

    };


    return (
        emojis[
            severity
        ] ||
        "⚪"
    );

}


// ============================================================
// PRIORITY EMOJI
// ============================================================

function getPriorityEmoji(
    priority
) {

    const emojis = {

        Normal:
            "🔵",

        Important:
            "🟠",

        Urgent:
            "🚨"

    };


    return (
        emojis[
            priority
        ] ||
        "⚪"
    );

}


// ============================================================
// STATUS EMOJI
// ============================================================

function getStatusEmoji(
    status
) {

    const emojis = {

        Pending:
            "🟡",

        "In Progress":
            "🔵",

        Resolved:
            "🟢"

    };


    return (
        emojis[
            status
        ] ||
        "⚪"
    );

}


// ============================================================
// DATE FORMAT
// ============================================================

function formatDate(
    value
) {

    if (!value) {

        return "Not available";

    }


    try {

        const date =
            new Date(
                value
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return String(
                value
            );

        }


        return date.toLocaleString(
            "en-IN",
            {

                dateStyle:
                    "medium",

                timeStyle:
                    "short"

            }
        );

    }
    catch (
        error
    ) {

        return String(
            value
        );

    }

}


// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHTML(
    value
) {

    if (
        value ===
            null ||
        value ===
            undefined
    ) {

        return "";

    }


    return String(
        value
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// ============================================================
// WINDOW RESIZE
// ============================================================

window.addEventListener(
    "resize",
    () => {

        if (complaintMap) {

            setTimeout(
                () => {

                    complaintMap.invalidateSize(
                        true
                    );

                },
                100
            );

        }

    }
);


// ============================================================
// FINAL MESSAGE
// ============================================================

console.log(
    "CivicAI 8.0.0 script loaded successfully."
);