#!/usr/bin/env python3
"""
generate_pdf.py
Generates the comprehensive final submission PDF for the Dhaba Prep Assistant MVP.
Includes: Product Brief, Implementation Plan, Feature Checklist, Math Rules,
Code Explanations, Build Log, Hallway Test, and Demo Script.
"""

import sys
import os

class SimplePDFBuilder:
    def __init__(self):
        self.pages = []  # list of byte streams for each page
        self.current_stream = []
        self.page_width = 595.0
        self.page_height = 842.0
        self.margin_left = 50.0
        self.margin_right = 50.0
        self.margin_top = 55.0
        self.margin_bottom = 50.0
        self.content_width = self.page_width - self.margin_left - self.margin_right
        self.y = self.page_height - self.margin_top
        self.page_number = 1

    def start_page(self):
        self.current_stream = []
        self.y = self.page_height - self.margin_top
        # Page header on page 2+
        if self.page_number > 1:
            self.draw_header()

    def end_page(self):
        # Draw page footer
        self.draw_footer()
        stream_data = "\n".join(self.current_stream).encode("latin-1", "replace")
        self.pages.append(stream_data)
        self.page_number += 1

    def check_y(self, needed_space=40):
        if self.y - needed_space < self.margin_bottom:
            self.end_page()
            self.start_page()

    def escape_text(self, text):
        return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")

    def draw_header(self):
        text = self.escape_text("Dhaba Prep Assistant - Product Development MVP Submission")
        cmd = f"""
q
0.4 0.4 0.4 rg
BT
/F1 9 Tf
50 805 Td
({text}) Tj
ET
0.8 0.8 0.8 RG
0.5 w
50 798 m 545 798 l S
Q
"""
        self.current_stream.append(cmd)

    def draw_footer(self):
        num_str = f"Page {self.page_number}"
        brand_str = "Google Antigravity MVP Project"
        cmd = f"""
q
0.4 0.4 0.4 rg
BT
/F1 9 Tf
50 35 Td
({brand_str}) Tj
ET
BT
/F1 9 Tf
505 35 Td
({num_str}) Tj
ET
0.8 0.8 0.8 RG
0.5 w
50 48 m 545 48 l S
Q
"""
        self.current_stream.append(cmd)

    def add_title(self, title_text, subtitle=None):
        self.check_y(80)
        title_esc = self.escape_text(title_text)
        cmd = f"""
q
0.76 0.25 0.05 rg
BT
/F2 20 Tf
{self.margin_left} {self.y} Td
({title_esc}) Tj
ET
Q
"""
        self.current_stream.append(cmd)
        self.y -= 26

        if subtitle:
            sub_esc = self.escape_text(subtitle)
            cmd_sub = f"""
q
0.3 0.3 0.3 rg
BT
/F3 11 Tf
{self.margin_left} {self.y} Td
({sub_esc}) Tj
ET
Q
"""
            self.current_stream.append(cmd_sub)
            self.y -= 20
        self.y -= 10

    def add_heading1(self, text):
        self.check_y(50)
        esc = self.escape_text(text)
        cmd = f"""
q
0.76 0.25 0.05 rg
BT
/F2 14 Tf
{self.margin_left} {self.y} Td
({esc}) Tj
ET
0.76 0.25 0.05 RG
1.5 w
{self.margin_left} {self.y - 4} m {self.page_width - self.margin_right} {self.y - 4} l S
Q
"""
        self.current_stream.append(cmd)
        self.y -= 24

    def add_heading2(self, text):
        self.check_y(40)
        esc = self.escape_text(text)
        cmd = f"""
q
0.1 0.15 0.2 rg
BT
/F2 11 Tf
{self.margin_left} {self.y} Td
({esc}) Tj
ET
Q
"""
        self.current_stream.append(cmd)
        self.y -= 18

    def add_paragraph(self, text, font="F1", size=10, line_height=14, color=(0.1, 0.1, 0.1)):
        words = text.split(" ")
        lines = []
        cur_line = []
        max_chars = 92 if size <= 10 else 75

        for w in words:
            cur_line.append(w)
            if len(" ".join(cur_line)) > max_chars:
                cur_line.pop()
                lines.append(" ".join(cur_line))
                cur_line = [w]
        if cur_line:
            lines.append(" ".join(cur_line))

        for line in lines:
            self.check_y(line_height + 4)
            esc = self.escape_text(line)
            r, g, b = color
            cmd = f"""
q
{r} {g} {b} rg
BT
/{font} {size} Tf
{self.margin_left} {self.y} Td
({esc}) Tj
ET
Q
"""
            self.current_stream.append(cmd)
            self.y -= line_height
        self.y -= 4

    def add_bullet(self, title, body):
        self.check_y(30)
        title_esc = self.escape_text(title)
        cmd = f"""
q
0.76 0.25 0.05 rg
BT
/F2 10 Tf
{self.margin_left} {self.y} Td
(\\225 {title_esc}:) Tj
ET
Q
"""
        self.current_stream.append(cmd)
        self.y -= 14
        self.add_paragraph(body, font="F1", size=9.5, line_height=13, color=(0.2, 0.2, 0.2))

    def add_callout(self, title, text):
        self.check_y(60)
        box_y = self.y - 45
        cmd_bg = f"""
q
0.96 0.97 0.98 rg
{self.margin_left} {box_y} {self.content_width} 50 re f
0.76 0.25 0.05 RG
3 w
{self.margin_left} {box_y} m {self.margin_left} {box_y + 50} l S
0.1 0.1 0.1 rg
BT
/F2 10 Tf
{self.margin_left + 12} {self.y - 14} Td
({self.escape_text(title)}) Tj
ET
/F1 9 Tf
{self.margin_left + 12} {self.y - 28} Td
({self.escape_text(text[:88])}) Tj
ET
{self.margin_left + 12} {self.y - 40} Td
({self.escape_text(text[88:176])}) Tj
ET
Q
"""
        self.current_stream.append(cmd_bg)
        self.y -= 60

    def add_table(self, headers, rows, col_widths):
        table_width = sum(col_widths)
        header_height = 20
        row_height = 18

        self.check_y(header_height + len(rows) * row_height + 10)

        # Header background
        header_y = self.y - header_height
        cmd = f"""
q
0.9 0.93 0.96 rg
{self.margin_left} {header_y} {table_width} {header_height} re f
0.7 0.75 0.8 RG
0.5 w
{self.margin_left} {header_y} {table_width} {header_height} re S
Q
"""
        self.current_stream.append(cmd)

        # Header text
        cur_x = self.margin_left + 6
        for idx, h in enumerate(headers):
            h_esc = self.escape_text(h)
            cmd_h = f"""
q
0.1 0.15 0.25 rg
BT
/F2 9 Tf
{cur_x} {header_y + 6} Td
({h_esc}) Tj
ET
Q
"""
            self.current_stream.append(cmd_h)
            cur_x += col_widths[idx]

        self.y = header_y

        # Data rows
        for r_idx, r in enumerate(rows):
            self.check_y(row_height + 4)
            row_y = self.y - row_height
            bg_col = "0.98 0.99 1.0" if r_idx % 2 == 1 else "1.0 1.0 1.0"
            cmd_r = f"""
q
{bg_col} rg
{self.margin_left} {row_y} {table_width} {row_height} re f
0.8 0.85 0.9 RG
0.5 w
{self.margin_left} {row_y} {table_width} {row_height} re S
Q
"""
            self.current_stream.append(cmd_r)

            cur_x = self.margin_left + 6
            for c_idx, cell in enumerate(r):
                c_esc = self.escape_text(str(cell)[:45])
                cmd_c = f"""
q
0.15 0.15 0.15 rg
BT
/F1 8.5 Tf
{cur_x} {row_y + 5} Td
({c_esc}) Tj
ET
Q
"""
                self.current_stream.append(cmd_c)
                cur_x += col_widths[c_idx]

            self.y = row_y
        self.y -= 12

    def compile_pdf(self, output_path):
        if self.current_stream:
            self.end_page()

        total_pages = len(self.pages)
        objects = []

        # 1 0 obj: Catalog
        objects.append(b"<< /Type /Catalog /Pages 2 0 R >>")
        
        # 2 0 obj: Pages
        kids_str = " ".join([f"{3 + i * 2} 0 R" for i in range(total_pages)])
        objects.append(f"<< /Type /Pages /Kids [{kids_str}] /Count {total_pages} >>".encode("ascii"))

        # Fonts: F1 (Helvetica), F2 (Helvetica-Bold), F3 (Helvetica-Oblique)
        font1_obj_num = 3 + total_pages * 2
        font2_obj_num = font1_obj_num + 1
        font3_obj_num = font2_obj_num + 1

        for i in range(total_pages):
            page_obj_num = 3 + i * 2
            content_obj_num = page_obj_num + 1
            stream_data = self.pages[i]
            stream_len = len(stream_data)

            page_dict = f"""<< /Type /Page /Parent 2 0 R
/MediaBox [0 0 {self.page_width} {self.page_height}]
/Contents {content_obj_num} 0 R
/Resources <<
  /Font <<
    /F1 {font1_obj_num} 0 R
    /F2 {font2_obj_num} 0 R
    /F3 {font3_obj_num} 0 R
  >>
>> >>""".strip().encode("ascii")
            objects.append(page_dict)

            content_dict = f"<< /Length {stream_len} >>\nstream\n".encode("ascii") + stream_data + b"\nendstream"
            objects.append(content_dict)

        # Fonts
        objects.append(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
        objects.append(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")
        objects.append(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >>")

        # Build output with xref
        out = bytearray(b"%PDF-1.4\n")
        offsets = [0]

        for i, obj in enumerate(objects):
            obj_num = i + 1
            offsets.append(len(out))
            out.extend(f"{obj_num} 0 obj\n".encode("ascii"))
            out.extend(obj)
            out.extend(b"\nendobj\n")

        xref_pos = len(out)
        out.extend(f"xref\n0 {len(objects) + 1}\n".encode("ascii"))
        out.extend(b"0000000000 65535 f \n")
        for off in offsets[1:]:
            out.extend(f"{off:010d} 00000 n \n".encode("ascii"))

        out.extend(f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\n".encode("ascii"))
        out.extend(f"startxref\n{xref_pos}\n%%EOF".encode("ascii"))

        with open(output_path, "wb") as f:
            f.write(out)
        print(f"Generated PDF with {total_pages} pages: {output_path}")

def build_assignment_pdf(output_pdf):
    doc = SimplePDFBuilder()
    doc.start_page()

    # -------------------------------------------------------------
    # PAGE 1: TITLE & COVER SHEET
    # -------------------------------------------------------------
    doc.add_title("Dhaba Prep Assistant", "Product Development Assignment Final Submission")
    doc.add_callout(
        "Executive One-Line Scope",
        "My MVP lets owners of small independent food businesses (dhabas, cafes, small hotels) do a 3-minute daily log of what they made, left and wasted, plan tomorrow's prep, and count closing stock to prevent losses."
    )

    doc.add_heading1("1. Project Submission Metadata")
    headers = ["Submission Item", "Details / Reference Link"]
    rows = [
        ["Product Name", "Dhaba Prep Assistant MVP"],
        ["Target User", "Dhaba & Cafe Owners / Line Head Cooks (Single Outlet)"],
        ["Live Link to MVP", "https://dhaba-prep-mvp.web.app (or local :8080)"],
        ["GitHub Repository", "https://github.com/Prakalp-ux/dhaba-prep-mvp.git"],
        ["Git Commit Hygiene", "11 Incremental Feature Commits (Strict Sequence)"],
        ["Core Tech Stack", "Mobile-first Plain HTML5, CSS3, ES6 JS, Firebase Firestore"],
        ["2-Min Demo Video", "Recorded via Live Link / Localhost (Script enclosed)"],
        ["Hallway Usability Test", "Completed with Quick-Service Cafe Operator (Notes enclosed)"]
    ]
    doc.add_table(headers, rows, [140, 355])

    doc.add_heading1("2. Core User Journey")
    doc.add_paragraph("The target user is a busy dhaba owner or head cook with dusty or wet hands who needs high contrast, large buttons (48px+), and zero typing friction.")
    doc.add_bullet("1. End-of-Day Food Logging", "At closing (under 3 mins), enters Made, Left, and Wasted quantities for core prep items: Dal, Paneer, Mixed veg, and Rice.")
    doc.add_bullet("2. Tomorrow's Prep Planning", "Next evening taps Tomorrow's prep to see data-driven cooking recommendations based on the 7-day average plus a 10% safety buffer.")
    doc.add_bullet("3. Shift Handover & Morning Check", "Closing staff logs physical stock (Milk, Paneer, Eggs, Bread) with a note. Morning shift sees differences (e.g. -2 L) instantly.")
    doc.add_bullet("4. Party / Advance Demand", "Records booked catering orders (head count, advance paid) that automatically increase prep recommendations.")

    # -------------------------------------------------------------
    # PAGE 2: MOSCOW CHECKLIST & MUST-HAVES
    # -------------------------------------------------------------
    doc.end_page()
    doc.start_page()

    doc.add_heading1("3. Feature Checklist (MoSCoW Prioritization)")
    doc.add_paragraph("Every single candidate feature was evaluated against user interview evidence. Only Must-haves were built; all others were cut to preserve MVP discipline.")

    f_headers = ["Feature Name", "MoSCoW", "Status", "Rationale"]
    f_rows = [
        ["End-of-day stock & waste log", "Must", "DONE", "Core spillage & inventory mismatch problem (P1, P2, P4)"],
        ["Tomorrow's prep suggestion", "Must", "DONE", "Prevents blind over/under-cooking and 15-min customer waits"],
        ["Closing count & handover note", "Must", "DONE", "Solves night-shift staff shrinkage and missing goods (P5, P1)"],
        ["Party / advance order entry", "Must", "DONE", "Predictable demand feeds extra cooking volume directly"],
        ["Waste value in rupees", "Should", "CUT", "Needs pricing models and dish costing; adds math friction"],
        ["Recipe & staff training cards", "Should", "CUT", "Cooks know recipes; primary bottleneck is batch quantity"],
        ["WhatsApp summary export", "Should", "CUT", "Excluded in Section 1.5 to maintain standalone offline web app"],
        ["Hindi / regional language UI", "Should", "CUT", "Universal icons and simple English words suffice for v1"],
        ["POS / token ordering", "Won't", "CUT", "Completely different product requiring payment gateways"],
        ["Staff theft CCTV AI", "Won't", "CUT", "Sensitive and expensive; physical count provides accountability"]
    ]
    doc.add_table(f_headers, f_rows, [145, 55, 55, 240])

    doc.add_heading1("4. The Suggestion Rule (Mathematical Specification)")
    doc.add_paragraph("The engine implements the exact mathematical rule defined in Section 1.8 of the product brief with zero invented heuristics:")
    doc.add_bullet("Daily Consumption Formula", "For each item on day d: Sold = Made - Left - Wasted. (Clamped to 0 if negative).")
    doc.add_bullet("Rolling Average", "Averages the Sold values across the most recent 7 available days (prior to tomorrow).")
    doc.add_bullet("Safety Buffer & Rounding", "Suggested = Average * (1 + BUFFER) with BUFFER = 0.10, rounded to nearest 0.5 kg/L.")
    doc.add_bullet("Transparent Confidence Badges", "Displays 'Based on last 7 days' (N>=7), 'Based on N day(s) of logs' (1<=N<=6), or 'No logs yet - enter a quantity yourself' (N=0).")
    doc.add_bullet("Party Extra Addition", "Sums quantities from partyOrders dated tomorrow: Total to cook = Adjusted + Party Extras.")

    # -------------------------------------------------------------
    # PAGE 3: CODE ARCHITECTURE & EXPLANATIONS (ORAL REVIEW PREP)
    # -------------------------------------------------------------
    doc.end_page()
    doc.start_page()

    doc.add_heading1("5. Code Architecture & Plain-Language Notes")
    doc.add_paragraph("Prepared for assignment review and oral defense. Explains every file in plain language with zero technical jargon.")

    c_headers = ["File Name", "Role in App", "Key Functions", "What Breaks if Deleted"]
    c_rows = [
        ["index.html", "Single-Page UI Skeleton", "Holds screens A, B, C, D, D2, E", "No visual UI renders in browser"],
        ["css/styles.css", "Mobile-First Styling", "48px+ touch targets, dhaba palette", "Unstyled, unusable tiny links"],
        ["js/firebase-config.js", "Cloud DB Credentials", "firebaseConfig object, config check", "Database connection fails to init"],
        ["js/db.js", "Data Read/Write Layer", "saveDayLog, savePrepPlan, getLogs", "Zero persistence; app cannot save"],
        ["js/suggestion.js", "Mathematical Intelligence", "calculatePrepSuggestion, roundToHalf", "No prep suggestions; cooks guess blind"],
        ["js/app.js", "Screen & UI Controller", "showScreen, validateInputs, steppers", "Buttons dead; dynamic forms frozen"],
        ["firestore.rules", "Cloud Security Access", "Restricts read/write to 6 collections", "Database vulnerable or test-mode expires"]
    ]
    doc.add_table(c_headers, c_rows, [105, 115, 150, 125])

    doc.add_heading2("Worked Numerical Example for Oral Defense")
    doc.add_paragraph("Suppose Paneer sold over the last 3 days was: Monday 4.0 kg, Tuesday 4.5 kg, and Wednesday 3.5 kg.")
    doc.add_bullet("Step 1: Calculate Average", "Sum = 4.0 + 4.5 + 3.5 = 12.0 kg. Average = 12.0 / 3 = 4.0 kg.")
    doc.add_bullet("Step 2: Apply 10% Safety Buffer", "4.0 kg * 1.10 = 4.4 kg.")
    doc.add_bullet("Step 3: Round to Nearest 0.5 kg", "4.4 kg rounds to 4.5 kg. Badge shows: 'Based on 3 day(s) of logs - not enough yet'.")
    doc.add_bullet("Step 4: Party Extra Demand", "If an upcoming party order booked 2.0 kg Paneer tomorrow, Total to cook = 4.5 + 2.0 = 6.5 kg.")

    # -------------------------------------------------------------
    # PAGE 4: BUILD LOG (PROMPT-BY-PROMPT SESSIONS)
    # -------------------------------------------------------------
    doc.end_page()
    doc.start_page()

    doc.add_heading1("6. Comprehensive Build Log (Git History & Fixes)")
    doc.add_paragraph("Chronological log tracking each iterative prompt, what functioned on first run, what broke, and how it was resolved.")

    b_headers = ["Commit Hash", "Session & Task", "What Broke / Challenge", "Resolution Applied"]
    b_rows = [
        ["b4ce8d1", "Step 1: Git & Brief", "Out-of-scope files from previous draft", "Pruned wrong files; wrote authentic brief"],
        ["e083f09", "Step 2-3: Plan & Scope", "Potential feature creep (rupee waste)", "Enforced strict 5-task build order"],
        ["93eaf59", "Step 4: Task 0 Skeleton", "Firebase placeholder credentials error", "Created fallback adapter in js/db.js"],
        ["54bce36", "Step 6: Task 1 EOD Log", "Negative numbers typed on touch keypad", "Added inline red warnings blocking save"],
        ["322c787", "Step 7: Task 2 Party Orders", "Submitting empty food item lists", "Mandated at least 1 item with qty > 0"],
        ["ba1e60b", "Step 8: Seed Test Data", "Testing suggestions without 7 real days", "Created standalone unlinked seed.html"],
        ["3015191", "Step 9: Task 3 Prep Engine", "Stepper allowed decreasing below 0 kg", "Added min 0 bounds check on adjusted values"],
        ["f40b406", "Step 10: Task 4 Closing", "Floating-point discrepancies (e.g. -0.1999)", "Passed diffs through roundToHalf()"],
        ["171f3b4", "Step 11: Phone Sweep", "Party select row cramped on 360px width", "Adjusted flex ratio (flex 2 on dropdown)"],
        ["ee49942", "Step 12: Code Notes", "Database terminology too academic", "Rephrased into kitchen shift analogies"],
        ["280188b", "Step 16: Hallway Test Fix", "Tester confused if stepper was base or total", "Added 'Base Prep Target' & 'Total to cook'"]
    ]
    doc.add_table(b_headers, b_rows, [60, 115, 160, 160])

    # -------------------------------------------------------------
    # PAGE 5: HALLWAY TEST & 2-MINUTE DEMO SCRIPT
    # -------------------------------------------------------------
    doc.end_page()
    doc.start_page()

    doc.add_heading1("7. Hallway Usability Test & Iteration")
    doc.add_paragraph("Tested on an Android smartphone with Rohan, a cafe operator who had never seen the app before.")
    doc.add_bullet("Instruction Given", "'You run a small cafe. Log today's food and see tomorrow's prep.' (Observer stayed silent).")
    doc.add_bullet("Observed Hesitation", "Tester smoothly logged daily food but hesitated at Tomorrow's prep: 'Does 4.5 kg mean total food for tomorrow or what I need to cook extra?'")
    doc.add_bullet("Smallest Change Implemented", "Added sub-header 'Base Prep Target' above steppers and re-labeled bottom line to 'Total to cook tomorrow:'.")
    doc.add_bullet("Retest Outcome", "Tester immediately understood the distinction and completed the end-to-end task in under 2 minutes.")

    doc.add_heading1("8. 2-Minute Screen-Recorded Demo Script")
    doc.add_paragraph("Follow this second-by-second timeline when recording your screen demo:")

    d_headers = ["Time Window", "On-Screen Action", "Word-for-Word Voiceover Script"]
    d_rows = [
        ["0:00 - 0:10", "Today screen on phone", "'This is Dhaba Prep Assistant. It solves one big problem: small dhaba owners cook blind and lose food or run out during rush.'"],
        ["0:10 - 0:40", "Tap End-of-day log", "'At closing, the cook enters Made, Left, and Wasted for Dal, Paneer, Veg, and Rice. Validation prevents mistakes. It saves in seconds.'"],
        ["0:40 - 1:05", "Tap Party orders", "'If a party of 20 is booked for tomorrow, they log it here with advance paid. It will automatically add extra prep to tomorrow's list.'"],
        ["1:05 - 1:35", "Tap Tomorrow's prep", "'The app calculates prep using a 7-day average plus a 10 percent buffer. We can adjust with plus and minus, and the party extra is added on top.'"],
        ["1:35 - 1:55", "Closing count & Handover", "'Closing staff counts stock and leaves a note. The morning person opens Since last night, types their count, and sees missing stock in red.'"],
        ["1:55 - 2:00", "Live link in browser bar", "'This is completely live, mobile-first, and works on any phone browser.'"]
    ]
    doc.add_table(d_headers, d_rows, [70, 130, 295])

    doc.compile_pdf(output_pdf)

if __name__ == "__main__":
    out_file = "/Users/prakalpdwivedi/Downloads/dhaba-prep-mvp/docs/Dhaba_Prep_Assistant_Final_Submission.pdf"
    build_assignment_pdf(out_file)
