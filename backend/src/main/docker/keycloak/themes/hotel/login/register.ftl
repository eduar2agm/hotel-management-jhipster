<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('firstName','lastName','email','username','password','password-confirm') displayInfo=true; section>
    
    <#if section = "header">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');

            body {
                background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important;
                min-height: 80vh;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: 'Lato', sans-serif;
                margin: 0;
                color: #e2e8f0;
                /* Prevenir scroll en pantallas pequeñas si es posible */
                overflow-x: hidden; 
            }

            #kc-header, #kc-content, #kc-container-wrapper {
                width: 100%; display: flex; justify-content: center; align-items: center; border: none;
            }

            .login-card {
                background: rgba(30, 41, 59, 0.75);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                border: 1px solid rgba(212, 175, 55, 0.2);
                border-radius: 8px;
                /* RECORTE: Padding reducido de 30px a 20px */
                padding: 20px 25px; 
                box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
                width: 100%; 
                position: relative;
                z-index: 10;
                margin: 10px;
            }

            /* RECORTE: Márgenes reducidos */
            .card-header { text-align: center; margin-bottom: 1rem; }
            /* RECORTE: Logo más pequeño */
            .hotel-logo { max-height: 55px; margin-bottom: 8px; filter: drop-shadow(0 0 6px rgba(212, 175, 55, 0.3)); }
            /* RECORTE: Título más pequeño */
            .hotel-title { font-family: 'Playfair Display', serif; color: #D4AF37; font-size: 1.5rem; margin: 0; }
            .hotel-subtitle { font-family: 'Lato', sans-serif; color: #94a3b8; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 1.5px; margin-top: 2px; }

            .form-row { display: flex; gap: 10px; }
            .form-row .form-group { flex: 1; }
            /* RECORTE: Menos espacio entre inputs */
            .form-group { margin-bottom: 0.8rem; }

            /* RECORTE: Fuente de labels más pequeña */
            label { display: block; color: #cbd5e1; font-size: 0.75rem; margin-bottom: 0.3rem; font-weight: 300; }
            
            input[type="text"], input[type="password"], input[type="email"] {
                width: 100%; box-sizing: border-box; 
                /* RECORTE: Input más delgado */
                padding: 8px 10px;
                background: rgba(15, 23, 42, 0.6); border: 1px solid #475569;
                border-radius: 4px; color: #fff; 
                /* RECORTE: Letra dentro del input más pequeña */
                font-size: 0.85rem; 
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

            .card-footer { margin-top: 1rem; text-align: center; font-size: 0.8rem; color: #94a3b8; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.8rem; }
            .link { color: #D4AF37; text-decoration: none; }
            .link:hover { color: #fceabb; text-decoration: underline; }

            @media (max-width: 400px) {
                .form-row { flex-direction: column; gap: 0; }
            }
        </style>
        <span class="sr-only">${msg("registerTitle")}</span>

    <#elseif section = "form">
        <div class="login-card" style="max-width: 380px;"> 
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
                <span>¿Ya eres miembro? <a href="${url.loginUrl}" class="link">${msg("backToLogin")}</a></span>
            </div>
        </div>
    </#if>
</@layout.registrationLayout>