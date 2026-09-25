const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, req.body.customFilename || file.originalname);
    }
});
const upload = multer({ storage: storage });

app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post('/upload-custom', upload.single('pdfFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    res.json({ success: true, url: `/view/${req.file.filename}` });
});

app.get('/view/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);
    
    if (fs.existsSync(filePath)) {
        res.send(`
        <!DOCTYPE html>
        <html lang="bn">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>ভূমি উন্নয়ন কর - ডিজিটাল রসিদ</title>
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
            <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"></script>
            <style>
                body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #eaedea; color: #333; overflow-x: hidden; }
                .desktop-header { display: block; }
                .mobile-header { display: none; }
                .header-container { display: flex; height: 85px; background: white; border-bottom: 2px solid #ddd; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
                .logo-area { width: 350px; display: flex; align-items: center; padding-left: 8%; background: white; z-index: 2;}
                .logo-area img { height: 45px; margin-right: 12px; }
                .logo-area .title { font-size: 24px; color: #000; }
                .right-area { flex-grow: 1; display: flex; flex-direction: column; }
                
                .top-bar-bg { height: 35px; background: linear-gradient(to right, rgba(255,255,255,0) 0%, #468c5b 30%, #468c5b 100%); display: flex; justify-content: flex-end; align-items: center; padding-right: 8%; color: white; font-size: 13px; font-weight: bold; }
                
                /* Updated Language Toggle CSS Desktop */
                .lang-toggle { margin-left: 20px; display: flex; border: 1px solid white; border-radius: 2px; overflow: hidden; font-size: 13px;}
                .lang-toggle span { padding: 2px 8px; cursor: pointer; transition: 0.3s; }
                .lang-toggle .active { background-color: #0c5625; color: white; }
                .lang-toggle .inactive { background-color: white; color: #468c5b; }
                
                .nav-bar { flex-grow: 1; background-color: white; display: flex; justify-content: flex-end; align-items: center; padding-right: 8%; font-size: 16px; font-weight: bold; }
                .nav-bar a { text-decoration: none; color: #000; margin-left: 25px; display: flex; align-items: center; }
                .nav-bar a i { font-size: 12px; margin-left: 6px; color: #555; }
                .nav-bar .login-btn { background-color: #0c5625; color: white; padding: 8px 25px; border-radius: 20px; margin-left: 25px; font-size: 15px;}
                .nav-bar .login-btn i { color: white; }
                
                .mobile-header { background: white; }
                .m-top-bar { background-color: #1b5e20; color: white; text-align: center; padding: 8px 10px; font-size: 12px; font-weight: bold; display: flex; justify-content: center; align-items: center;}
                
                /* Updated Language Toggle CSS Mobile */
                .m-lang-toggle { margin-left: 10px; display: flex; border: 1px solid white; border-radius: 2px; overflow: hidden; font-size: 11px;}
                .m-lang-toggle span { padding: 1px 5px; cursor: pointer; transition: 0.3s; }
                .m-lang-toggle .active { background-color: #0c5625; color: white; }
                .m-lang-toggle .inactive { background-color: white; color: #1b5e20; }
                
                .m-nav-container { display: flex; justify-content: space-between; align-items: center; padding: 10px 15px; border-bottom: 1px solid #ddd;}
                .m-logo-area { display: flex; align-items: center; }
                .m-logo-area img { height: 35px; margin-right: 10px;}
                .m-logo-area .title { font-size: 18px; color: #000; }
                .hamburger { font-size: 24px; color: #1b5e20; cursor: pointer; }
                .m-login-btn { background-color: #1b5e20; color: white; padding: 5px 15px; border-radius: 15px; font-size: 13px; text-decoration: none; font-weight:bold;}
                
                .viewer-container { text-align: center; padding: 30px 20px 0px 20px; min-height: 85vh; background-color: #eaedea; }
                .pdf-outer-wrapper { background-color: #e8f5e9; max-width: 900px; margin: 0 auto; padding: 15px 30px 30px 30px; border: 1px solid #c8e6c9; box-sizing: border-box; position: relative; }
                .print-btn-container { text-align: center; margin-bottom: 15px; }
                .print-btn { background-color: #3b82f6; color: white; border: none; padding: 8px 25px; border-radius: 4px; cursor: pointer; font-size: 14px; display: inline-flex; align-items: center; gap: 6px; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
                #pdf-container { background-color: white; box-shadow: 0 0 15px rgba(0,0,0,0.15); margin: 0 auto; width: 100%; max-width: 820px; overflow: hidden; }
                #pdf-render { width: 100%; height: auto; display: block; }
                .loader-text { font-size: 16px; font-weight: bold; color: #388e3c; padding: 40px; }
                
                @media (max-width: 768px) { .desktop-header { display: none; } .mobile-header { display: block; } .viewer-container { padding: 10px; background-color: #e8f5e9; } .pdf-outer-wrapper { padding: 0; border: none; background-color: transparent;} #pdf-container { box-shadow: none; border: 1px solid #ddd; } .footer { flex-direction: column; align-items: center; text-align: center; } .footer-col { margin-bottom: 20px; } }
                
                .bottom-divider { height: 12px; background: linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(46,125,50,0.8) 50%, rgba(255,255,255,1) 100%); width: 100%; margin-top: 0px; }
                .footer { background-color: #e8f5e9; padding: 40px 8%; display: flex; justify-content: space-between; font-size: 13px; align-items: flex-start;}
                .footer-col h4 { font-size: 15px; margin-bottom: 15px; margin-top: 0; color: #000; font-weight: bold;}
                .footer-col ul { list-style: none; padding: 0; margin: 0; }
                .footer-col ul li { margin-bottom: 10px; display: flex; align-items: center;}
                .footer-col ul li i { color: #2e7d32; margin-right: 8px; font-size: 10px; }
                .footer-col a { text-decoration: none; color: #111; font-weight: bold;}
                .social-icons img { height: 30px; cursor: pointer; }
                .logos-row img { height: 60px; }
                .tech-support img { height: 40px; margin-top: 5px; }
                .bottom-bar { display: flex; justify-content: space-between; padding: 15px 8%; background-color: white; font-size: 12px; color: #000; font-weight: bold; border-top: 1px solid #ddd; }
            </style>
        </head>
        <body>
            <div class="desktop-header">
                <div class="header-container">
                    <div class="logo-area">
                        <img src="/images/image_253414.png.png" alt="Logo" onerror="this.style.display='none'">
                        <div class="title">ভূমি উন্নয়ন কর</div>
                    </div>
                    <div class="right-area">
                        <div class="top-bar-bg">
                            <!-- ডাইনামিক ডেট ফিল্ড (Desktop) -->
                            <span id="desktop-date">লোড হচ্ছে...</span>
                            <div class="lang-toggle">
                                <span class="bn active" onclick="setLanguage('bn')">বাং</span>
                                <span class="en inactive" onclick="setLanguage('en')">EN</span>
                            </div>
                        </div>
                        <div class="nav-bar">
                            <a href="#">হোম</a>
                            <a href="#">মন্ত্রণালয়/ বিভাগ <i class="fas fa-caret-down"></i></a>
                            <a href="#">ভূমিসেবা ফর্ম</a>
                            <a href="#">গার্ড ফাইল <i class="fas fa-caret-down"></i></a>
                            <a href="#" class="login-btn">লগইন <i class="fas fa-caret-down"></i></a>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="mobile-header">
                <div class="m-top-bar">
                    <!-- ডাইনামিক ডেট ফিল্ড (Mobile) -->
                    <span id="mobile-date">লোড হচ্ছে...</span>
                    <div class="m-lang-toggle">
                        <span class="bn active" onclick="setLanguage('bn')">বাং</span>
                        <span class="en inactive" onclick="setLanguage('en')">EN</span>
                    </div>
                </div>
                <div class="m-nav-container">
                    <i class="fas fa-arrow-left" style="font-size: 18px; color: #555;"></i>
                    <div class="m-logo-area">
                        <img src="/images/image_253414.png.png" alt="Logo" onerror="this.style.display='none'">
                        <div class="title">ভূমি উন্নয়ন কর</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <a href="#" class="m-login-btn">লগইন <i class="fas fa-caret-down"></i></a>
                        <i class="fas fa-bars hamburger"></i>
                    </div>
                </div>
            </div>
            
            <div class="viewer-container">
                <div class="pdf-outer-wrapper">
                    <div class="print-btn-container">
                        <button class="print-btn" onclick="printPdf()"><i class="fas fa-print"></i> প্রিন্ট</button>
                    </div>
                    <div id="pdf-container">
                        <div id="loader" class="loader-text">রসিদ লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...</div>
                        <canvas id="pdf-render" style="display:none;"></canvas>
                    </div>
                </div>
            </div>
            
            <div class="bottom-divider"></div>
            <div class="footer">
                <div class="footer-col">
                    <h4>গুরুত্বপূর্ণ লিঙ্ক</h4>
                    <ul>
                        <li><i class="fas fa-play"></i> <a href="#">বাংলাদেশ জাতীয় তথ্য বাতায়ন</a></li>
                        <li><i class="fas fa-play"></i> <a href="#">ভূমি মন্ত্রণালয়</a></li>
                        <li><i class="fas fa-play"></i> <a href="#">তথ্য অদিদপ্তর (পিআইডি)</a></li>
                        <li><i class="fas fa-play"></i> <a href="#">অভিযোগ প্রতিকার ব্যবস্থা</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h4 style="visibility: hidden;">Links</h4>
                    <ul>
                        <li><i class="fas fa-play"></i> <a href="#">গোপনীয়তা নীতি</a></li>
                        <li><i class="fas fa-play"></i> <a href="#">সাধারণ জিজ্ঞাসা</a></li>
                    </ul>
                </div>
                <div class="footer-col" style="text-align: center;">
                    <h4>পরিকল্পনা ও বাস্তবায়নে</h4>
                    <div class="logos-row">
                        <img src="/images/image_2533b6.png.png" alt="পরিকল্পনা ও বাস্তবায়নে" onerror="this.alt='Image Missing'">
                    </div>
                </div>
                <div class="footer-col" style="text-align: center;">
                    <h4>অ্যাপ ডাউনলোড করুন</h4>
                    <div style="display:flex; justify-content:center; gap:10px;">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" height="35">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" height="35">
                    </div>
                </div>
                <div class="footer-col" style="text-align: center;">
                    <h4>সামাজিক যোগাযোগ</h4>
                    <div class="social-icons">
                        <img src="/images/image_24e1fe.png.png" alt="সামাজিক যোগাযোগ" onerror="this.alt='Image Missing'">
                    </div>
                    <div style="margin-top: 25px;">
                        <h4 style="font-weight: normal; margin-bottom: 5px;">কারিগরি সহায়তায়</h4>
                        <div class="tech-support">
                            <img src="/images/image_24e1c3.png.png" alt="MySoftHeaven" onerror="this.alt='Image Missing'">
                        </div>
                    </div>
                </div>
            </div>
            <div class="bottom-bar">
                <div>কপিরাইট ২০২৬ ভূমি ব্যবস্থাপনা অটোমেশন প্রকল্প, ভূমি মন্ত্রণালয়।</div>
                <div>পরীক্ষামূলক সংস্করণ</div>
            </div>
            
            <script>
                // স্বয়ংক্রিয়ভাবে প্রতিদিনের আসল তারিখ ও দিন দেখানোর স্ক্রিপ্ট
                function generateDynamicDate() {
                    const today = new Date();
                    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                    // তারিখকে সুন্দরভাবে বাংলায় কনভার্ট করবে
                    const formattedDate = today.toLocaleDateString('bn-BD', options);
                    
                    document.getElementById('desktop-date').innerText = formattedDate;
                    document.getElementById('mobile-date').innerText = formattedDate;
                }
                
                generateDynamicDate();

                // ভাষা পরিবর্তন (বাং/EN) বোতামের স্ক্রিপ্ট
                function setLanguage(lang) {
                    const bnBtns = document.querySelectorAll('.bn');
                    const enBtns = document.querySelectorAll('.en');
                    
                    if (lang === 'bn') {
                        bnBtns.forEach(btn => { btn.classList.add('active'); btn.classList.remove('inactive'); });
                        enBtns.forEach(btn => { btn.classList.add('inactive'); btn.classList.remove('active'); });
                    } else if (lang === 'en') {
                        enBtns.forEach(btn => { btn.classList.add('active'); btn.classList.remove('inactive'); });
                        bnBtns.forEach(btn => { btn.classList.add('inactive'); btn.classList.remove('active'); });
                        
                        // যেহেতু পুরো সাইটের ইংরেজি ভার্সন নেই, তাই ব্যবহারকারীকে সতর্ক করা
                        alert("The English version is currently under construction. Please use the Bengali version.");
                    }
                }

                // পিডিএফ রেন্ডার করার স্ক্রিপ্ট (আপনার আগের কোড)
                const url = '/uploads/${filename}';
                const pdfjsLib = window['pdfjs-dist/build/pdf'];
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
                const loadingTask = pdfjsLib.getDocument(url);
                loadingTask.promise.then(function(pdf) {
                    pdf.getPage(1).then(function(page) {
                        const scale = window.innerWidth <= 768 ? 1.5 : 2.0; 
                        const viewport = page.getViewport({scale: scale});
                        const canvas = document.getElementById('pdf-render');
                        const context = canvas.getContext('2d');
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;
                        const renderContext = { canvasContext: context, viewport: viewport };
                        page.render(renderContext).promise.then(function() {
                            document.getElementById('loader').style.display = 'none';
                            canvas.style.display = 'block';
                        });
                    });
                }).catch(function(reason) {
                    console.error('Error rendering PDF:', reason);
                    document.getElementById('loader').innerText = "পিডিএফ লোড করতে সমস্যা হয়েছে!";
                });
                
                function printPdf() {
                    let iframe = document.getElementById('print-iframe');
                    if (!iframe) {
                        iframe = document.createElement('iframe');
                        iframe.id = 'print-iframe';
                        iframe.style.display = 'none';
                        iframe.src = url;
                        document.body.appendChild(iframe);
                        iframe.onload = function() {
                            setTimeout(function() { iframe.contentWindow.focus(); iframe.contentWindow.print(); }, 500);
                        };
                    } else {
                        iframe.contentWindow.focus(); iframe.contentWindow.print();
                    }
                }
            </script>
        </body>
        </html>
        `);
    } else {
        res.status(404).send('<h2 style="text-align:center; color:red; margin-top:50px;">ফাইলটি পাওয়া যায়নি!</h2>');
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'file-maker.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`সার্ভার চলছে পোর্টে: ${port}`);
});
