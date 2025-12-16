<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('firstName','lastName','email','username','password','password-confirm') displayInfo=true; section>
    
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
                overflow: hidden; /* Evita scrollbars innecesarios */
                position: relative; /* Referencia para el centrado absoluto */
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
                position: static !important; /* Desactivamos el layout de Keycloak */
            }

            /* --- 3. TARJETA FLOTANTE (Centrado Matemático) --- */
            .login-card {
                position: absolute; /* Flotamos la tarjeta libremente */
                top: 64%;
                left: 50%;
                /* TRUCO: -50% en X centra horizontalmente. -65% en Y centra y SUBE la tarjeta */
                transform: translate(-50%, -65%); 
                
                width: 100%;
                max-width: 450px; /* Tu ancho solicitado */
                
                background: rgba(30, 41, 59, 0.75);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                border: 1px solid rgba(212, 175, 55, 0.2);
                border-radius: 8px;
                padding: 25px 40px; 
                box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
                z-index: 100;
            }

            /* --- 4. ESTILOS INTERNOS --- */
            .card-header { text-align: center; margin-bottom: 1rem; }
            .hotel-logo { max-height: 50px; margin-bottom: 5px; filter: drop-shadow(0 0 6px rgba(212, 175, 55, 0.3)); }
            .hotel-title { font-family: 'Playfair Display', serif; color: #D4AF37; font-size: 1.6rem; margin: 0; }
            .hotel-subtitle { font-family: 'Lato', sans-serif; color: #94a3b8; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 1.5px; margin-top: 2px; }

            .form-row { display: flex; gap: 15px; }
            .form-row .form-group { flex: 1; }
            .form-group { margin-bottom: 0.6rem; }

            label { display: block; color: #cbd5e1; font-size: 0.75rem; margin-bottom: 0.2rem; font-weight: 300; }
            
            input[type="text"], input[type="password"], input[type="email"] {
                width: 100%; box-sizing: border-box; 
                padding: 8px 10px;
                background: rgba(15, 23, 42, 0.6); border: 1px solid #475569;
                border-radius: 4px; color: #fff; font-size: 0.85rem; 
                transition: all 0.3s ease;
            }
            input:focus { outline: none; border-color: #D4AF37; background: rgba(15, 23, 42, 0.9); box-shadow: 0 0 8px rgba(212, 175, 55, 0.15); }

            .btn-primary {
                width: 100%; padding: 9px; margin-top: 0.5rem;
                background: linear-gradient(45deg, #b8952b, #D4AF37);
                border: none; border-radius: 4px; color: #0f172a; font-weight: 700;
                cursor: pointer; text-transform: uppercase; letter-spacing: 1px; font-size: 0.85rem;
                transition: transform 0.2s, box-shadow 0.2s;
            }
            .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3); }

            .card-footer { margin-top: 0.8rem; text-align: center; font-size: 0.8rem; color: #94a3b8; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.8rem; }
            .link { color: #D4AF37; text-decoration: none; }
            .link:hover { color: #fceabb; text-decoration: underline; }

            @media (max-width: 500px) {
                .login-card { width: 90%; max-width: none; }
                .form-row { flex-direction: column; gap: 0; }
            }
        </style>
        <span class="sr-only">${msg("registerTitle")}</span>

    <#elseif section = "form">
        <div class="login-card"> 
            <div class="card-header">
                <img src="${url.resourcesPath}/img/logoN.png" alt="Royal Hotel" class="hotel-logo" />
                <h1 class="hotel-title">Bienvenido</h1>
                <p class="hotel-subtitle">Registro Exclusivo</p>
            </div>

            <form id="kc-register-form" action="${url.registrationAction}" method="post">
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="firstName">${msg("firstName")}</label>
                        <input type="text" id="firstName" name="firstName" value="${(register.formData.firstName!'')}" required />
                    </div>
                    <div class="form-group">
                        <label for="lastName">${msg("lastName")}</label>
                        <input type="text" id="lastName" name="lastName" value="${(register.formData.lastName!'')}" required />
                    </div>
                </div>

                <div class="form-group">
                    <label for="email">${msg("email")}</label>
                    <input type="email" id="email" name="email" value="${(register.formData.email!'')}" required autocomplete="email" />
                </div>

                <#if !realm.registrationEmailAsUsername>
                    <div class="form-group">
                        <label for="username">${msg("username")}</label>
                        <input type="text" id="username" name="username" value="${(register.formData.username!'')}" required autocomplete="username" />
                    </div>
                </#if>

                <#if passwordRequired??>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="password">${msg("password")}</label>
                            <input type="password" id="password" name="password" required autocomplete="new-password" />
                        </div>
                        <div class="form-group">
                            <label for="password-confirm">${msg("passwordConfirm")}</label>
                            <input type="password" id="password-confirm" name="password-confirm" required />
                        </div>
                    </div>
                </#if>

                <button class="btn-primary" type="submit">
                    ${msg("doRegister")}
                </button>

            </form>

            <div class="card-footer">
                <span>¿Ya es miembro? <a href="${url.loginUrl}" class="link">${msg("backToLogin")}</a></span>
            </div>
        </div>
    </#if>
</@layout.registrationLayout>