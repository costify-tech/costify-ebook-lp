/* =========================================================
   COSTIFY LANDING PAGE V2
   JavaScript (VERSI PERBAIKAN)
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const form =
        document.getElementById("leadForm");

    const formContainer =
        document.getElementById(
            "leadFormContainer"
        );

    const successMessage =
        document.getElementById(
            "successMessage"
        );

    const backButton =
        document.getElementById(
            "backButton"
        );

    const nameInput =
        document.getElementById("name");

    const emailInput =
        document.getElementById("email");

    const whatsappInput =
        document.getElementById("whatsapp");

    const nameError =
        document.getElementById(
            "nameError"
        );

    const emailError =
        document.getElementById(
            "emailError"
        );

    const whatsappError =
        document.getElementById(
            "whatsappError"
        );


    /* =====================================================
       YEAR
    ====================================================== */

    const yearEl = document.getElementById("year");

    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }


    /* =====================================================
       CLEAR ERROR
    ====================================================== */

    function clearErrors() {

        nameError.textContent = "";

        whatsappError.textContent = "";

        emailError.textContent = "";

        nameInput.removeAttribute(
            "aria-invalid"
        );

        whatsappInput.removeAttribute(
            "aria-invalid"
        );

        emailInput.removeAttribute(
            "aria-invalid"
        );
    }


    /* =====================================================
       EMAIL VALIDATION
    ====================================================== */

    function isValidEmail(email) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            .test(email);

    }


    /* =====================================================
       WHATSAPP VALIDATION

       Menerima format umum nomor Indonesia:
       08xxxxxxxxx, +628xxxxxxxxx, atau 628xxxxxxxxx.
       Spasi/tanda hubung/tanda kurung diabaikan
       sebelum dicek.
    ====================================================== */

    function isValidWhatsapp(number) {

        const cleaned =
            number.replace(/[\s\-().]/g, "");

        return /^(\+62|62|0)8[1-9][0-9]{6,10}$/
            .test(cleaned);

    }


    /* =====================================================
       KONFIGURASI BACKEND

       Ganti sesuai project Supabase Anda.
       Project ref terlihat di URL dashboard Supabase:
       supabase.com/dashboard/project/<PROJECT_REF>
    ====================================================== */

    const SUBMIT_LEAD_URL =
        "https://fhprszpmpjkbwtztgasv.supabase.co/functions/v1/submit-lead";


    /* =====================================================
       FORM SUBMIT
    ====================================================== */

    if (form) {

        form.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                clearErrors();


                const name =
                    nameInput.value.trim();

                const whatsapp =
                    whatsappInput.value.trim();

                const email =
                    emailInput.value.trim();


                let valid = true;

                let firstInvalidInput = null;


                /* NAMA */

                if (name.length < 2) {

                    nameError.textContent =
                        "Silakan masukkan nama Anda.";

                    nameInput.setAttribute(
                        "aria-invalid",
                        "true"
                    );

                    valid = false;

                    firstInvalidInput =
                        firstInvalidInput || nameInput;
                }


                /* WHATSAPP */

                if (!isValidWhatsapp(whatsapp)) {

                    whatsappError.textContent =
                        "Masukkan nomor WhatsApp yang valid (contoh: 08123456789).";

                    whatsappInput.setAttribute(
                        "aria-invalid",
                        "true"
                    );

                    valid = false;

                    firstInvalidInput =
                        firstInvalidInput || whatsappInput;
                }


                /* EMAIL */

                if (!isValidEmail(email)) {

                    emailError.textContent =
                        "Masukkan alamat email yang valid.";

                    emailInput.setAttribute(
                        "aria-invalid",
                        "true"
                    );

                    valid = false;

                    firstInvalidInput =
                        firstInvalidInput || emailInput;
                }


                if (!valid) {

                    /* Pindahkan fokus ke field pertama yang error
                       agar lebih ramah untuk pengguna keyboard/screen reader */

                    firstInvalidInput.focus();

                    return;
                }


                /* =================================================
                   KIRIM KE BACKEND (Supabase Edge Function)

                   Edge Function ini akan:
                   1. Menyimpan data ke tabel ebook_leads_lp
                   2. Mendaftarkan subscriber ke MailerLite
                   3. MailerLite Automation otomatis mengirim e-book
                ================================================== */

                const submitButton =
                    form.querySelector(
                        ".btn-submit"
                    );

                const originalButtonText =
                    submitButton.textContent;

                submitButton.disabled = true;
                submitButton.textContent =
                    "Mengirim...";


                try {

                    const response =
                        await fetch(
                            SUBMIT_LEAD_URL,
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },
                                body: JSON.stringify({
                                    name: name,
                                    whatsapp: whatsapp,
                                    email: email
                                })
                            }
                        );

                    if (!response.ok) {
                        throw new Error(
                            "Gagal mengirim data"
                        );
                    }

                    formContainer.style.display =
                        "none";

                    successMessage.style.display =
                        "block";


                    successMessage.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });


                    /* Pindahkan fokus ke pesan sukses
                       supaya screen reader langsung membacanya */

                    successMessage.setAttribute(
                        "tabindex",
                        "-1"
                    );

                    successMessage.focus();


                } catch (err) {

                    emailError.textContent =
                        "Terjadi kesalahan saat mengirim data. Silakan coba lagi.";

                } finally {

                    submitButton.disabled = false;
                    submitButton.textContent =
                        originalButtonText;

                }

            }
        );

    }


    /* =====================================================
       BACK TO FORM
    ====================================================== */

    if (backButton) {

        backButton.addEventListener(
            "click",
            function () {

                successMessage.style.display =
                    "none";

                formContainer.style.display =
                    "block";

                nameInput.focus();

            }
        );

    }


    /* =====================================================
       SMOOTH SCROLL
       (DIPERBAIKI: lewati href="#" kosong, misalnya
       pada logo/brand, agar tidak error di console)
    ====================================================== */

    document
        .querySelectorAll(
            'a[href^="#"]'
        )
        .forEach(function (anchor) {

            anchor.addEventListener(
                "click",
                function (event) {

                    const targetId =
                        anchor.getAttribute(
                            "href"
                        );

                    /* Lewati jika href hanya "#" saja
                       (contoh: link logo di header) */

                    if (
                        !targetId ||
                        targetId.length <= 1
                    ) {
                        return;
                    }


                    const target =
                        document.querySelector(
                            targetId
                        );


                    if (!target) {
                        return;
                    }


                    event.preventDefault();


                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }
            );

        });

});
