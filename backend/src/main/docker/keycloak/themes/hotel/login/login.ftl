<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username','password') displayInfo=realm.password && realm.registrationAllowed && !registrationDisabled??; section>

    <#if section = "header">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');

            /* --- 1. FONDO Y ESTRUCTURA BASE --- */
            html, body {
                height: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important;
                font-family: 'Lato', sans-serif;
                color: #e2e8f0;
                overflow: hidden;
                position: relative;
            }

            /* --- 2. ELIMINAR INTERFERENCIAS DE KEYCLOAK --- */
            #kc-header, #kc-header-wrapper { display: none !important; }
            
            #kc-page-container, #kc-content, #kc-content-wrapper, .card-pf, #kc-container-wrapper {
                background: transparent !important;
                box-shadow: none !important;
                border: none !important;
                padding: 0 !important;
                margin: 0 !important;
                width: auto !important;
                height: auto !important;
                position: static !important;
            }

            /* --- 3. TARJETA FLOTANTE (Centrado Matemático) --- */
            .login-card {
                position: absolute;
                top: 64%;
                left: 50%;
                /* TRUCO: -50% X, -65% Y para subirla visualmente */
                transform: translate(-50%, -65%);
                
                width: 100%;
                max-width: 420px; /* Ancho solicitado */
                
                background: rgba(30, 41, 59, 0.75);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                border: 1px solid rgba(212, 175, 55, 0.2);
                border-radius: 8px;
                padding: 25px 45px;
                box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
                z-index: 100;
            }

            /* --- 4. ESTILOS INTERNOS --- */
            .card-header { text-align: center; margin-bottom: 1.5rem; }
            .hotel-logo { max-height: 60px; margin-bottom: 5px; filter: drop-shadow(0 0 8px rgba(212, 175, 55, 0.3)); }
            .hotel-title { font-family: 'Playfair Display', serif; color: #D4AF37; font-size: 2rem; margin: 0; }
            .hotel-subtitle { font-family: 'Lato', sans-serif; color: #94a3b8; text-transform: lowercase; font-size: 0.8rem; letter-spacing: 3px; margin-top: 5px; }

            .form-group { margin-bottom: 1rem; }
            
            label { display: block; color: #cbd5e1; font-size: 0.9rem; margin-bottom: 0.3rem; font-weight: 300; }

            input[type="text"], input[type="password"], input[type="email"] {
                width: 100%; box-sizing: border-box;
                padding: 10px 14px;
                background: rgba(15, 23, 42, 0.6); border: 1px solid #475569;
                border-radius: 4px; color: #fff; font-size: 1rem;
                transition: all 0.3s ease;
            }
            input:focus { outline: none; border-color: #D4AF37; background: rgba(15, 23, 42, 0.9); box-shadow: 0 0 15px rgba(212, 175, 55, 0.15); }

            .password-container { position: relative; display: flex; align-items: center; }
            .toggle-icon {
                position: absolute; right: 12px; background: none; border: none;
                color: #64748b; cursor: pointer; transition: color 0.3s; padding: 0;
                display: flex; align-items: center;
            }
            .toggle-icon:hover { color: #D4AF37; }

            .form-options {
                display: flex; justify-content: space-between; align-items: center;
                margin-bottom: 1.5rem; font-size: 0.9rem;
            }
            .checkbox-wrapper { display: flex; align-items: center; gap: 8px; color: #cbd5e1; }
            .link { color: #D4AF37; text-decoration: none; transition: color 0.2s; }
            .link:hover { color: #fceabb; text-decoration: underline; }

            .btn-primary {
                width: 100%; padding: 10px;
                background: linear-gradient(45deg, #b8952b, #D4AF37);
                border: none; border-radius: 4px; color: #0f172a; font-weight: 700; font-size: 1rem;
                cursor: pointer; text-transform: uppercase; letter-spacing: 1px;
                transition: transform 0.2s, box-shadow 0.2s;
            }
            .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(212, 175, 55, 0.3); }

            .card-footer { margin-top: 1.5rem; text-align: center; font-size: 0.9rem; color: #94a3b8; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1rem; }

            @media (max-width: 480px) {
                .login-card { width: 90%; max-width: none; }
            }
        </style>
        <span class="sr-only">Login</span>

    <#elseif section = "form">
        <div class="login-card">
            
            <div class="card-header">
                <img src="${url.resourcesPath}/img/logoN.png" alt="Hotel Management" class="hotel-logo" />
                <h1 class="hotel-title">Hotel Management</h1>
                <p class="hotel-subtitle">Portal de Huéspedes</p>
            </div>

            <#if realm.password>
                <form id="kc-form-login" onsubmit="login.disabled = true; return true;" action="${url.loginAction}" method="post">
                    
                    <div class="form-group">
                        <label for="username">
                            <#if !realm.loginWithEmailAllowed>${msg("username")}
                            <#elseif !realm.registrationEmailAsUsername>${msg("usernameOrEmail")}
                            <#else>${msg("email")}</#if>
                        </label>
                        <input id="username" name="username" value="${(login.username!'')}" type="text" autofocus autocomplete="off" placeholder="Usuario o Email" />
                    </div>

                    <div class="form-group">
                        <label for="password">${msg("password")}</label>
                        <div class="password-container">
                            <input id="password" name="password" type="password" autocomplete="off" placeholder="Contraseña" />
                            <button type="button" class="toggle-icon" onclick="togglePassword('password', this)" tabindex="-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                                    <circle cx="12" cy="12" r="3"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div class="form-options">
                        <#if realm.rememberMe && !usernameEditDisabled??>
                            <div class="checkbox-wrapper">
                                <#if login.rememberMe??>
                                    <input id="rememberMe" name="rememberMe" type="checkbox" checked>
                                <#else>
                                    <input id="rememberMe" name="rememberMe" type="checkbox">
                                </#if>
                                <label for="rememberMe" style="cursor:pointer; margin:0;">${msg("rememberMe")}</label>
                            </div>
                        </#if>
                        <div class="forgot-pass">
                            <#if realm.resetPasswordAllowed>
                                <a href="${url.loginResetCredentialsUrl}" class="link">${msg("doForgotPassword")}</a>
                            </#if>
                        </div>
                    </div>

                    <button class="btn-primary" name="login" id="kc-login" type="submit">
                        ${msg("doLogIn")}
                    </button>

                </form>
            </#if>

            <#if realm.password && realm.registrationAllowed && !registrationDisabled??>
                <div class="card-footer">
                    <span>${msg("noAccount")} <a href="${url.registrationUrl}" class="link">${msg("doRegister")}</a></span>
                </div>
            </#if>
        </div>

        <script>
            function togglePassword(id, btn) {
                const input = document.getElementById(id);
                const svg = btn.querySelector('svg');
                if (input.type === "password") {
                    input.type = "text";
                    btn.style.color = "#D4AF37"; 
                } else {
                    input.type = "password";
                    btn.style.color = ""; 
                }
            }
        </script>
    </#if>
</@layout.registrationLayout>