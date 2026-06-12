# Prompt Log & Development Journey

เอกสารนี้สรุปประวัติคำสั่ง (Prompt Log) ที่คุณได้สั่งงาน AI (Antigravity) ตลอดระยะเวลาการพัฒนาโปรเจกต์ **Restaurant Selection Dashboard** ตั้งแต่จุดเริ่มต้นจนถึงการนำขึ้นระบบ Vercel 

---

## 📅 Phase 1: การวางแผนและการตั้งค่าเริ่มต้น (Planning & Setup)

**1. เริ่มต้นโปรเจกต์ (Initial Prompt):**
- **โจทย์หลัก:** สร้าง Workflow เพื่อค้นหา วิเคราะห์ ให้คะแนน และแนะนำร้านอาหารสำหรับทีม 8-12 คน ในพื้นที่ 5 ย่าน (สยาม, อารีย์, ทองหล่อ, อโศก, พร้อมพงษ์)
- **Scoring Model:** กำหนดเกณฑ์คะแนน (Rating 25, Group 20, Price 15, Travel 15, Data 15, Unique 10) รวม 100 คะแนน
- **Theme:** Minimal luxury เปลี่ยนหน้าตาตาม Location
- **เงื่อนไขสำคัญ:** ข้อมูลดึงมาจาก n8n -> Google Sheets ห้ามใช้ความรู้ทั่วไปตอบ ห้ามทำเป็น Slide/PDF ให้ทำเป็นหน้าเว็บ HTML สวยงาม

**2. ปรับแก้แผนงานจาก AI (Implementation Plan Feedback):**
- ระบุชื่อผู้เข้าสอบ: `Ranthananun Worawaran`
- ยืนยันว่าต้องสามารถเลือกได้ทุกพื้นที่ (ไม่ต้อง Fix แค่ทองหล่อ)
- ปฏิเสธการใช้ Mock Data แจ้งว่า: *"ไม่ ข้อมูลนี้จะดึงมาจาก Google Sheet ที่บันทึกโดย n8n ซึ่งฉันจะต้องต่อเข้าไปทีหลัง..."*
- ถามหา Tool ดึงข้อมูล: *"มีแนะนำตัวอื่นที่ฟรี และใช้งานได้ดี ซึ่งสามารถดึงข้อมูลจาก Google Map ได้โดยตรงไหม"*
- ย้ำให้ใช้คะแนนที่ให้ไปอย่างเคร่งครัด และต้องการให้เว็บดึงข้อมูล (Fetch) แบบของจริงเท่านั้น

---

## 🛠️ Phase 2: การพัฒนาส่วนแสดงผลและการเชื่อมต่อข้อมูล (Development & Integration)

**3. การเชื่อมต่อ Google Sheets:**
- *"ตอนนี้ gg sheet พร้อมแล้ว ต้องทำอะไรต่อ"* (แจ้งเพิ่มเติมว่ามีคอลัมน์ Phone และแยกเป็น 5 ชีทตามย่าน)
- ถามคำถามสำคัญ: *"ถ้า Sheet มีการ update เว็บจะ update ด้วยไหม"* (AI ยืนยันว่าอัปเดตแบบ Real-time)

**4. แก้ปัญหาดึงข้อมูลไม่ขึ้น (Debugging Data Fetch):**
- แจ้ง Error: *"Failed to load data for Siam. Please check your CSV URL. ([object XMLHttpRequestProgressEvent])"*
- ทยอยส่งลิงก์ Published CSV ของทั้ง 5 พื้นที่มาให้ AI ใส่ในโค้ด
- แจ้งว่า: *"ไม่เห็นได้เบย"*
- แจ้งเพิ่มเติมว่าให้เอาส่วนของโจทย์ออก: *"แก้ไข HTML มีแค่ฟังก์ชันที่ควรจะเป็น ไม่ต้องมีโจทย์"*
- แจ้งปัญหาระบบค้าง: *"Fetching data from Google Sheets... นานมาก ไม่ไปต่อ"* (AI แก้ปัญหาเรื่อง Error เรื่องวันที่ทำให้ระบบค้าง)

---

## 🎨 Phase 3: การปรับปรุง UI และ UX ตามต้องการ (UI/UX Refinement)

**5. การปรับโครงสร้างปุ่มและเลย์เอาต์:**
- เปลี่ยนคำว่า *Review* เป็น *Go to Restaurant*
- เปลี่ยน *Top 10 Ranking* เป็น *All Restaurant* เรียงตามแรงก์ พร้อมใส่ข้อมูลให้ครบเหมือนใน Google Sheets
- ย้ายส่วน *Restaurant Comparison* ไปไว้ใต้ *Top 3 Recommendations*
- เพิ่มปุ่ม Filter สำหรับคัดกรองร้านแนะนำ (Top Recommendation, Save budget, Fast food, Meeting)

**6. ปรับแต่งความสวยงามของปุ่มและ Modal (Details):**
- *"design ปุ่มกรองสำหรับ Top Recommendation ไม่สวย ไม่เข้าธีม"*
- *"ทุก ๆ ร้านอาหาร มีปุ่ม Details สำหรับรายงานข้อมูลทั้งหมดใน GG sheet แบบสวยงาม อ่านง่าย โดยมีหัวข้อคือ id, restaurant_name, area, food_type, google_rating, ... ai_tradeoff"*
- *"ดีไซน์ปุ่ม Filter ของ Top Recommendations ยังไม่แก้"*
- *"กรอบหน้า Detail ดูตัน ๆ ไม่สมความหรูหรา"*
- *"วันที่ดูติดกัน อ่านยาก ควรเรียงวันจาก อาทิตย์-เสาร์ และเว้นบรรทัดใหม่ให้อ่านง่าย"*
- ให้ตั้งค่า Default พื้นที่เป็น สยาม (Siam)

**7. ประกอบร่างส่วน Header และทบทวนข้อมูลโครงสร้างโปรเจกต์:**
- ลบข้อความ *AI-POWERED REPORT* ออก
- เพิ่ม *"วันที่ทำ, ชื่อผู้เข้าสอบ (INT : Mark)"* ลงใน Header
- ให้นำส่วนที่เป็นบทความโจทย์กลับมาใส่เหมือนเดิม (Objective, Workflow Overview, Tools Used, Data Sources, Scoring Criteria)
- แก้ไขเครื่องมือ: *"Tools Used: Apify, Openai GPT 5-mini, n8n (Automation), Google Sheets, HTML/CSS/JS. แก้ไข Workflow Overview ให้สอดคล้องด้วย"*
- เปลี่ยน *Date* เป็น *Create Date:* และแก้ไขให้โชว์วันที่ของเมื่อวานเสมอ

---

## 🚀 Phase 4: การนำเว็บขึ้นเซิร์ฟเวอร์ (Deployment & Security)

**8. เตรียมการก่อน Deploy:**
- *"เตรียม Deploy ขึ้น github และ vercel, ลองรันทดสอบการทำงานของทั้งหมดว่าใช้งานได้จริงไหม, แสกนไฟล์ที่เกี่ยวข้องทั้งหมดถึงความปลอดภัยขั้นสูงสุดในการนำไปขึ้นบน vercel"*
- AI สร้างไฟล์ `.gitignore` และ `vercel.json` (ตั้งค่า Security Headers ขั้นสูงสุด) และอธิบายรายงานความปลอดภัย

**9. การแก้ปัญหา GitHub Authentication:**
- แจ้ง Error: *"Username for 'https://github.com':"* 
- แจ้ง Error: *"remote: Invalid username or token. Password authentication is not supported..."*
- ส่งภาพหน้าจอเครื่องหมาย `??` ในแอป GitHub Desktop ที่แสดงการหา Repository ไม่เจอ (AI รันคำสั่งรีเซ็ต Origin ให้จนแก้ปัญหาได้)

**10. ปัญหาคลาสสิคบน Vercel (CORS & CSP):**
- ถามก่อนทำ: *"มีอะไรต้องระวังไหม"* (AI อธิบายข้อจำกัดของ Security Policy อย่างละเอียด)
- แจ้ง Error หลังนำขึ้น Vercel: *"Failed to load data for Siam. Please check your CSV URL. ([object ProgressEvent])"* 
- AI ทำการแก้ `vercel.json` เพิ่มอนุญาตโดเมน `googleusercontent.com` เพื่อแก้ปัญหาการส่งต่อลิงก์ดาวน์โหลดของ Google Sheets

**11. สรุปจบ:**
- *"ขอ Prompt Log ที่ฉันสั่งงานคุณ โดยสรุปอย่างละเอียด เป็น .md"*
