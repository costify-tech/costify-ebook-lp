/* =========================================================
   COSTIFY LANDING PAGE EBOOK V3
   ========================================================= */

/* ---------- PENGATURAN (isi bagian ini) ---------- */
const CONFIG = {
    // Edge Function Supabase yang sudah ada
    SUBMIT_LEAD_URL:
        "https://fhprszpmpjkbwtztgasv.supabase.co/functions/v1/submit-lead",

    // Link unduh langsung e-book (PDF di hosting/Drive/Supabase Storage).
    // Kosong = tombol "Unduh E-book Sekarang" disembunyikan.
    EBOOK_URL: "",

    // Nomor WhatsApp Anda format 62812xxxxxxx (tanpa + dan tanpa 0 di depan).
    // Kosong = semua ajakan WA diganti ke 30DPC.
    WHATSAPP_NUMBER: "",

    // Halaman 30 Days Profit Challenge
    DPC_URL: "https://costify-30dpc.vercel.app/",

    // Link embed YouTube, contoh: https://www.youtube.com/embed/XXXXXXXXXXX?rel=0
    // Kosong = bagian video dan tombol "Lihat Penjelasannya" disembunyikan.
    VIDEO_EMBED_URL: ""
};


document.addEventListener("DOMContentLoaded", function () {

    const $ = function (id) { return document.getElementById(id); };

    const form = $("leadForm");
    const formContainer = $("leadFormContainer");
    const successMessage = $("successMessage");
    const backButton = $("backButton");

    const fields = {
        name: { input: $("name"), error: $("nameError") },
        whatsapp: { input: $("whatsapp"), error: $("whatsappError") },
        email: { input: $("email"), error: $("emailError") },
        businessType: { input: $("businessType"), error: $("businessTypeError") },
        revenue: { input: $("revenue"), error: $("revenueError") }
    };

    const yearEl = $("year");
    if (yearEl) { yearEl.textContent = new Date().getFullYear(); }


    /* ---------- VIDEO (hanya tampil jika link diisi) ---------- */

    const videoSection = $("video");
    const videoFrame = $("videoFrame");
    const videoLink = $("videoLink");

    if (CONFIG.VIDEO_EMBED_URL && videoFrame && videoSection) {
        videoFrame.src = CONFIG.VIDEO_EMBED_URL;
        videoSection.hidden = false;
    } else if (videoLink) {
        videoLink.remove();
    }


    /* ---------- UTM (sumber trafik) ---------- */

    const params = new URLSearchParams(window.location.search);
    const utm = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]
        .forEach(function (key) {
            const value = params.get(key);
            if (value) { utm[key] = value; }
        });


    /* ---------- VALIDASI ---------- */

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function isValidWhatsapp(number) {
        const cleaned = number.replace(/[\s\-().]/g, "");
        return /^(\+62|62|0)8[1-9][0-9]{6,10}$/.test(cleaned);
    }

    function clearErrors() {
        Object.keys(fields).forEach(function (key) {
            fields[key].error.textContent = "";
            fields[key].input.removeAttribute("aria-invalid");
        });
    }

    function setError(key, message) {
        fields[key].error.textContent = message;
        fields[key].input.setAttribute("aria-invalid", "true");
    }


    /* ---------- HALAMAN TERIMA KASIH ---------- */

    function waLink(text) {
        return "https://wa.me/" + CONFIG.WHATSAPP_NUMBER +
            "?text=" + encodeURIComponent(text);
    }

    function dpcLink(segment) {
        try {
            const url = new URL(CONFIG.DPC_URL);
            url.searchParams.set("utm_source", "ebook-lp");
            url.searchParams.set("utm_medium", "thankyou");
            url.searchParams.set("utm_content", segment);
            return url.toString();
        } catch (e) {
            return CONFIG.DPC_URL;
        }
    }

    function showSuccess(data) {

        $("successName").textContent = data.name.split(" ")[0];

        const downloadBtn = $("downloadBtn");
        if (CONFIG.EBOOK_URL) {
            downloadBtn.href = CONFIG.EBOOK_URL;
            downloadBtn.hidden = false;
        }

        const nextTitle = $("nextTitle");
        const nextText = $("nextText");
        const nextBtn = $("nextBtn");

        if (data.revenue === "besar" && CONFIG.WHATSAPP_NUMBER) {

            nextTitle.textContent =
                "Bicara langsung soal kebocoran profit di usaha Anda";
            nextText.textContent =
                "Dengan omzet sebesar itu, kebocoran kecil bisa berarti jutaan rupiah per bulan. Ceritakan kondisi usaha Anda, kami bantu petakan.";
            nextBtn.textContent = "Chat via WhatsApp";
            nextBtn.href = waLink(
                "Halo Costify, saya " + data.name + " (" + data.businessType +
                "). Saya sudah unduh e-book Rame Tapi Tidak Tenang dan ingin " +
                "konsultasi soal kebocoran profit usaha saya."
            );
            nextBtn.target = "_blank";
            nextBtn.rel = "noopener";

        } else {

            nextTitle.textContent =
                "Mau tahu seberapa besar bocor di usaha Anda?";
            nextText.textContent =
                "Ikuti 30 Days Profit Challenge: langkah demi langkah menghitung omzet, biaya, dan profit usaha Anda.";
            nextBtn.textContent = "Lihat 30 Days Profit Challenge";
            nextBtn.href = dpcLink(data.revenue);
        }

        formContainer.style.display = "none";
        successMessage.style.display = "block";

        successMessage.scrollIntoView({ behavior: "smooth", block: "center" });
        successMessage.setAttribute("tabindex", "-1");
        successMessage.focus();

        /* Pelacakan iklan (aktif hanya jika Pixel/GA terpasang) */
        if (typeof window.fbq === "function") { window.fbq("track", "Lead"); }
        if (typeof window.gtag === "function") { window.gtag("event", "generate_lead"); }
    }


    /* ---------- SUBMIT ---------- */

    if (form) {

        form.addEventListener("submit", async function (event) {

            event.preventDefault();
            clearErrors();

            const data = {
                name: fields.name.input.value.trim(),
                whatsapp: fields.whatsapp.input.value.trim(),
                email: fields.email.input.value.trim(),
                businessType: fields.businessType.input.value,
                revenue: fields.revenue.input.value
            };

            let firstInvalid = null;

            function fail(key, message) {
                setError(key, message);
                firstInvalid = firstInvalid || fields[key].input;
            }

            if (data.name.length < 2) { fail("name", "Silakan masukkan nama Anda."); }

            if (!isValidWhatsapp(data.whatsapp)) {
                fail("whatsapp", "Masukkan nomor WhatsApp yang valid (contoh: 08123456789).");
            }

            if (!isValidEmail(data.email)) {
                fail("email", "Masukkan alamat email yang valid.");
            }

            if (!data.businessType) { fail("businessType", "Pilih jenis usaha Anda."); }

            if (!data.revenue) { fail("revenue", "Pilih kisaran omzet Anda."); }

            if (firstInvalid) {
                firstInvalid.focus();
                return;
            }

            const submitButton = form.querySelector(".btn-submit");
            const originalText = submitButton.textContent;

            submitButton.disabled = true;
            submitButton.textContent = "Mengirim...";

            try {

                const response = await fetch(CONFIG.SUBMIT_LEAD_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(Object.assign({
                        name: data.name,
                        whatsapp: data.whatsapp,
                        email: data.email,
                        business_type: data.businessType,
                        monthly_revenue: data.revenue
                    }, utm))
                });

                if (!response.ok) { throw new Error("Gagal mengirim data"); }

                showSuccess(data);

            } catch (err) {

                fields.email.error.textContent =
                    "Terjadi kesalahan saat mengirim data. Silakan coba lagi.";

            } finally {

                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        });
    }


    /* ---------- KEMBALI KE FORM ---------- */

    if (backButton) {
        backButton.addEventListener("click", function () {
            successMessage.style.display = "none";
            formContainer.style.display = "block";
            fields.name.input.focus();
        });
    }


    /* ---------- SMOOTH SCROLL ---------- */

    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener("click", function (event) {

            const targetId = anchor.getAttribute("href");
            if (!targetId || targetId.length <= 1) { return; }

            const target = document.querySelector(targetId);
            if (!target) { return; }

            event.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });


    /* ---------- TOMBOL MELAYANG DI HP ---------- */

    const sticky = $("stickyCta");
    const hero = document.querySelector(".hero");
    const downloadSection = $("download");

    if (sticky && hero && downloadSection && "IntersectionObserver" in window) {

        let heroVisible = true;
        let formVisible = false;

        function update() {
            sticky.classList.toggle("show", !heroVisible && !formVisible);
        }

        new IntersectionObserver(function (entries) {
            heroVisible = entries[0].isIntersecting;
            update();
        }).observe(hero);

        new IntersectionObserver(function (entries) {
            formVisible = entries[0].isIntersecting;
            update();
        }).observe(downloadSection);
    }

});
