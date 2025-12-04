# Structured Reporting Web Tools

A web-based tool suite for generating structured medical reports, specifically focused on AJCC Cancer Staging. This project helps radiologists and clinicians efficiently create standardized staging reports that can be easily integrated into Radiology Information Systems (RIS).

## Features

*   **AJCC Cancer Staging:** Implements AJCC 8th edition staging forms for various cancer types.
*   **Automatic TNM Calculation:** Automatically calculates the correct staging based on user inputs.
*   **Reference Criteria:** Displays complete staging criteria within each specific cancer page for easy reference.
*   **RIS Integration:** Generates a text report that can be previewed and copied to the clipboard ("Show & Copy" feature) for pasting into RIS.
*   **Localized Standards:** Adapted from the Radiological Society of the Republic of China (RSROC) recommendations (additional version) and AJCC Cancer Staging Form Supplement.
*   **Recent Updates:** 
    *   Cervical Cancer updated to AJCC 9th Edition.
    *   Lung Cancer updated to AJCC 9th Edition.

## Supported Cancers

Includes forms for various cancers, including but not limited to:
*   Lung (AJCC 9th)
*   Colon
*   Cervix (AJCC 9th)
*   Esophagus
*   Gastric
*   Hepatocellular Carcinoma (HCC)
*   Nasopharynx
*   Oral Cavity
*   Oropharynx
*   Urinary Bladder
*   *Note: Currently excludes Larynx, Pancreas, GIST, RCC, and Osteogenic sarcoma.*

## Getting Started

### Prerequisites

*   Node.js (latest LTS version recommended)
*   npm (comes with Node.js)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/tsaiid/structured-reporting-web-tools.git
    cd structured-reporting-web-tools
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Development

To start the development server with hot reload:

```bash
npm run dev
```

Access the application at `http://localhost:8080` (or the port displayed in your terminal).

### Building for Production

To build the project for production (outputs to `dist/`):

```bash
npm run build
```

## Usage

1.  Open the application in a desktop browser (recommended width > 760px).
2.  Select the specific cancer type from the navigation menu.
3.  Fill out the staging form.
4.  Click the **"Show & Copy"** button in the top right.
5.  The generated text is copied to your clipboard and can be pasted into your report system.

## License

MIT License.

## Acknowledgments

*   Based on standards by the [Taiwan Radiological Society](https://www.rsroc.org.tw/).
*   AJCC Cancer Staging Manual.
