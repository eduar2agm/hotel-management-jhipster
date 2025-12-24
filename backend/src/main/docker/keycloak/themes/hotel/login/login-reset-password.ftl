<#import "template.ftl" as layout>
<@layout.registrationLayout displayInfo=true displayMessage=!messagesPerField.existsError('username'); section>
    
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

            /* --- 2. PARCHE KEYCLOAK (Ocultar elementos default) --- */
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

            /* --- 3. TARJETA FLOTANTE --- */
            .login-card {
                position: absolute;
                top: 59%;
                left: 50%;
                /* Centrado y ligeramente subido para elegancia */
                transform: translate(-50%, -60%);
                
                width: 100%;
                max-width: 450px;
                
                background: rgba(30, 41, 59, 0.75);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                border: 1px solid rgba(212, 175, 55, 0.2);
                border-radius: 8px;
                padding: 35px 45px;
                box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
                z-index: 100;
            }

            /* --- 4. ESTILOS INTERNOS --- */
            .card-header { text-align: center; margin-bottom: 2rem; }
            .hotel-logo { max-height: 60px; margin-bottom: 10px; filter: drop-shadow(0 0 8px rgba(212, 175, 55, 0.3)); }
            .hotel-title { font-family: 'Playfair Display', serif; color: #D4AF37; font-size: 1.8rem; margin: 0; font-weight: 400; letter-spacing: 1px; }
            .hotel-subtitle { font-family: 'Lato', sans-serif; color: #94a3b8; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 2px; margin-top: 5px; }

            /* Instrucciones */
            .instruction-text {
                text-align: center;
                color: #cbd5e1;
                font-size: 0.95rem;
                margin-bottom: 1.5rem;
                line-height: 1.5;
                font-weight: 300;
            }

            .form-group { margin-bottom: 1.5rem; }
            
            label { display: block; color: #cbd5e1; font-size: 0.85rem; margin-bottom: 0.4rem; font-weight: 300; }

            input[type="text"] {
                width: 100%; box-sizing: border-box;
                padding: 12px 14px;
                background: rgba(15, 23, 42, 0.6); border: 1px solid #475569;
                border-radius: 4px; color: #fff; font-size: 1rem;
                transition: all 0.3s ease;
            }
            input:focus { outline: none; border-color: #D4AF37; background: rgba(15, 23, 42, 0.9); box-shadow: 0 0 15px rgba(212, 175, 55, 0.15); }

            .btn-primary {
                width: 100%; padding: 12px;
                background: linear-gradient(45deg, #b8952b, #D4AF37);
                border: none; border-radius: 4px; color: #0f172a; font-weight: 700; font-size: 1rem;
                cursor: pointer; text-transform: uppercase; letter-spacing: 1px;
                transition: transform 0.2s, box-shadow 0.2s;
            }
            .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(212, 175, 55, 0.3); }

            .card-footer { margin-top: 2rem; text-align: center; font-size: 0.9rem; color: #94a3b8; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1.5rem; }
            .link { color: #D4AF37; text-decoration: none; transition: color 0.2s; }
            .link:hover { color: #fceabb; text-decoration: underline; }

            /* Estilo para mensajes de éxito/error de Keycloak si aparecen dentro */
            .alert-error { color: #ef4444; font-size: 0.9rem; text-align: center; margin-bottom: 1rem; }
            .alert-success { color: #10b981; font-size: 0.9rem; text-align: center; margin-bottom: 1rem; }

            @media (max-width: 500px) {
                .login-card { width: 90%; max-width: none; padding: 25px 20px; }
            }
        </style>
        <span class="sr-only">${msg("emailForgotTitle")}</span>

    <#elseif section = "form">
        <div class="login-card">
            
            <div class="card-header">
                <img src="${url.resourcesPath}/img/logoN.png" alt="Royal Hotel" class="hotel-logo" />
                <h1 class="hotel-title">Recuperar Acceso</h1>
                <p class="hotel-subtitle">Royal Hotel</p>
            </div>

            <p class="instruction-text">
                Ingrese su nombre de usuario o correo electrónico y le enviaremos las instrucciones para restablecer su contraseña.
            </p>

            <form id="kc-reset-password-form" action="${url.loginAction}" method="post">
                
                <div class="form-group">
                    <label for="username"><#if !realm.loginWithEmailAllowed>${msg("username")}<#elseif !realm.registrationEmailAsUsername>${msg("usernameOrEmail")}<#else>${msg("email")}</#if></label>
                    <input type="text" id="username" name="username" class="form-control" autofocus value="${(auth.attemptedUsername!'')}" placeholder="Ej: usuario@hotel.com" />
                </div>

                <div class="form-group">
                    <button class="btn-primary" type="submit">
                        ${msg("doSubmit")}
                    </button>
                </div>

                <div class="card-footer">
                    <span><a href="${url.loginUrl}" class="link">&laquo; ${msg("backToLogin")}</a></span>
                </div>
            </form>
        </div>
    </#if>
</@layout.registrationLayout>