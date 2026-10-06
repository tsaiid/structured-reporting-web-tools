# Structured Reporting Web Tools

A web-based tool suite for generating structured medical reports, specifically focused on AJCC Cancer Staging and lung screening. This project helps radiologists and clinicians efficiently create standardized staging reports that can be easily integrated into Radiology Information Systems (RIS).

## Features

*   **AJCC Cancer Staging & Screening:** Implements AJCC 8th and 9th edition staging forms for 26+ cancer types, alongside NHI Lung-RADS v2022.
*   **Automatic TNM Calculation:** Automatically calculates the correct staging based on user inputs.
*   **Reference Criteria:** Displays complete staging criteria within each specific cancer page for easy reference.
*   **RIS Integration:** Generates a text report that can be previewed and copied to the clipboard ("Show & Copy" feature) for pasting into RIS.
*   **Localized Standards:** Adapted from the Radiological Society of the Republic of China (RSROC / Taiwan Radiological Society) recommendations and AJCC Cancer Staging Form Supplements.
*   **Recent Updates:** 
    *   Nasopharyngeal Cancer (NPC) updated to AJCC 9th Edition.
    *   Cervical Cancer updated to AJCC 9th Edition.
    *   Lung Cancer updated to AJCC 9th Edition.

## Supported Cancers & Tools

*   **Head & Neck:**
    *   Oral Cavity (AJCC 8th, with DOI)
    *   Oropharynx (AJCC 8th, HPV+ / p16- dual staging system)
    *   Hypopharynx (AJCC 8th)
    *   Nasopharynx (AJCC 9th)
    *   Larynx (Supraglottis, Glottis, Subglottis) (AJCC 8th)
*   **Thorax:**
    *   Lung (AJCC 9th)
    *   NHI Lung-RADS (v2022)
*   **Gastrointestinal & Hepatobiliary:**
    *   Esophagus (AJCC 8th)
    *   Stomach (AJCC 8th)
    *   Gastrointestinal Stromal Tumor (GIST) (AJCC 8th)
    *   Hepatocellular Carcinoma (HCC) (AJCC 8th)
    *   Intrahepatic Bile Duct (AJCC 8th)
    *   Perihilar Bile Duct (AJCC 8th)
    *   Distal Bile Duct (AJCC 8th)
    *   Pancreas (AJCC 8th)
    *   Colon & Rectum (AJCC 8th)
*   **Genitourinary:**
    *   Renal Cell Carcinoma (RCC) (AJCC 8th)
    *   Urinary Bladder (AJCC 8th)
    *   Prostate (AJCC 8th)
*   **Gynecologic:**
    *   Cervix Uteri (AJCC 9th / FIGO 2018)
    *   Endometrium (AJCC 8th)
    *   Ovary (AJCC 8th)
*   **Bone Sarcoma:**
    *   Osteogenic Sarcoma (OGS) - Trunk / Extremities (AJCC 8th)
    *   Osteogenic Sarcoma (OGS) - Spine (AJCC 8th)
    *   Osteogenic Sarcoma (OGS) - Pelvis (AJCC 8th)

## Getting Started

### Prerequisites

*   Node.js (LTS version recommended)
*   pnpm (v9+ recommended, or enable via `corepack enable`)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/tsaiid/structured-reporting-web-tools.git
    cd structured-reporting-web-tools
    ```

2.  Install dependencies:
    ```bash
    pnpm install
    ```

### Development

To start the development server with hot reload:

```bash
pnpm dev
```

Access the application at `http://localhost:8080` (or the port displayed in your terminal).

### Running Tests

To run the unit test suite:

```bash
pnpm test
```

### Building for Production

To build the project for production (outputs to `dist/`):

```bash
pnpm build
```

## Usage

1.  Open the application in a desktop browser (recommended width > 760px).
2.  Select the specific cancer type or screening tool from the navigation menu or landing page.
3.  Fill out the staging form or screening criteria.
4.  Click the **"Show & Copy"** button in the top right.
5.  The generated text is copied to your clipboard and can be pasted into your report system.

## License

MIT License.

## Acknowledgments

*   Based on standards by the [Taiwan Radiological Society](https://www.rsroc.org.tw/).
*   AJCC Cancer Staging Manual.
