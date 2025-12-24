<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('password','password-confirm') displayInfo=true; section>
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
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                
                width: 100%;
                max-width: 450px;
                
                background: rgba(30, 41, 59, 0.75);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                border: 1px solid rgba(212, 175, 55, 0.2);
                border-radius: 8px;
                padding: 30px 40px;
                box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
                z-index: 100;
            }

            /* --- 4. ESTILOS INTERNOS --- */
            .card-header { text-align: center; margin-bottom: 1.5rem; }
            .hotel-logo { max-height: 60px; margin-bottom: 10px; filter: drop-shadow(0 0 8px rgba(212, 175, 55, 0.3)); }
            .hotel-title { font-family: 'Playfair Display', serif; color: #D4AF37; font-size: 1.8rem; margin: 0; font-weight: 400; letter-spacing: 1px; }
            .hotel-subtitle { font-family: 'Lato', sans-serif; color: #94a3b8; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 2px; margin-top: 5px; }

            .alert-warning {
                background-color: rgba(212, 175, 55, 0.1);
                border: 1px solid rgba(212, 175, 55, 0.3);
                color: #D4AF37;
                padding: 10px;
                border-radius: 4px;
                margin-bottom: 1.5rem;
                font-size: 0.9rem;
                display: flex;
                align-items: center;
            }
            .alert-warning .pficon { margin-right: 8px; }

            .form-group { margin-bottom: 1.2rem; }
            
            label { display: block; color: #cbd5e1; font-size: 0.9rem; margin-bottom: 0.4rem; font-weight: 300; }

            /* CORRECCIÓN AQUÍ: Aplicamos estilo a password Y text */
            input[type="password"],
            input[type="text"] { 
                width: 100%; box-sizing: border-box;
                padding: 12px 14px;
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
                height: 100%;
            }
            .toggle-icon:hover { color: #D4AF37; }

            .checkbox { margin-bottom: 1.5rem; display: flex; align-items: center; }
            .checkbox label { display: flex; align-items: center; color: #cbd5e1; font-size: 0.9rem; font-weight: 300; cursor: pointer; margin: 0; }
            .checkbox input[type="checkbox"] { margin-right: 8px; accent-color: #D4AF37; }

            .btn-primary {
                width: 100%; padding: 12px;
                background: linear-gradient(45deg, #b8952b, #D4AF37);
                border: none; border-radius: 4px; color: #0f172a; font-weight: 700; font-size: 1rem;
                cursor: pointer; text-transform: uppercase; letter-spacing: 1px;
                transition: transform 0.2s, box-shadow 0.2s;
            }
            .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(212, 175, 55, 0.3); }

            @media (max-width: 500px) {
                .login-card { width: 90%; max-width: none; padding: 25px 20px; }
                .hotel-title { font-size: 1.5rem; }
            }
        </style>
        <span class="sr-only">${msg("updatePasswordTitle")}</span>
    <#elseif section = "form">
        <div class="login-card">
            <div class="card-header">
                <img src="${url.resourcesPath}/img/logoN.png" alt="Royal Hotel" class="hotel-logo" />
                <h1 class="hotel-title">Actualizar Contraseña</h1>
                <p class="hotel-subtitle">Seguridad de la Cuenta</p>
            </div>

            <#if messagesPerField.existsError('password','password-confirm')>
                <div class="alert alert-warning">
                    <span class="pficon pficon-warning-triangle-o"></span>
                    ${msg("passwordErrorMessage")}
                </div>
            </#if>
            <#if message?has_content && message.type == 'warning'>
                 <div class="alert alert-warning">
                    <span class="pficon pficon-warning-triangle-o"></span>
                    ${message.summary}
                </div>
            </#if>

            <form id="kc-passwd-update-form" action="${url.loginAction}" method="post">
                <input type="text" id="username" name="username" value="${(login.username!'')}" autocomplete="username" readonly="readonly" style="display:none;"/>
                <input type="password" id="password" name="password" autocomplete="current-password" style="display:none;"/>

                <div class="form-group">
                    <label for="password-new">${msg("passwordNew")}</label>
                    <div class="password-container">
                        <input type="password" id="password-new" name="password-new" autofocus autocomplete="new-password" required />
                        <button type="button" class="toggle-icon" onclick="togglePassword('password-new', this)" tabindex="-1" aria-label="${msg('showPassword')}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="feather feather-eye">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="form-group">
                    <label for="password-confirm">${msg("passwordConfirm")}</label>
                    <div class="password-container">
                        <input type="password" id="password-confirm" name="password-confirm" autocomplete="new-password" required />
                        <button type="button" class="toggle-icon" onclick="togglePassword('password-confirm', this)" tabindex="-1" aria-label="${msg('showPassword')}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="feather feather-eye">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </button>
                    </div>
                </div>

                <#if isAppInitiatedAction??>
                    <div class="checkbox">
                        <label>
                            <input type="checkbox" id="logout-sessions" name="logout-sessions" value="on" checked>
                            ${msg("logoutOtherSessions")}
                        </label>
                    </div>
                </#if>

                <button class="btn-primary" type="submit">
                    ${msg("doSubmit")}
                </button>
            </form>
        </div>

        <script>
            function togglePassword(id, btn) {
                const input = document.getElementById(id);
                const svg = btn.querySelector('svg');
                if (input.type === "password") {
                    input.type = "text";
                    btn.style.color = "#D4AF37";
                    svg.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
                } else {
                    input.type = "password";
                    btn.style.color = "";
                    svg.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
                }
            }
        </script>
    </#if>
</@layout.registrationLayout>