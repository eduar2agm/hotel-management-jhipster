<#import "template.ftl" as layout>

<@layout.registrationLayout displayMessage=true; section>

    <#if section = "header">
        <span class="sr-only">Login</span>

    <#elseif section = "form">

        <style>

            html, body {
                background-color: #1a252f !important;
                margin: 0;
                padding: 0;
                height: 100%;
                width: 100%;
            }

            body, .login-pf-page, .login-pf {

                background: linear-gradient(135deg, #1a252f 0%, #0d1217 100%) !important;
                font-family: 'Segoe UI', sans-serif !important;
                height: 100vh;
                width: 100vw;
                margin: 0;
                padding: 0;
                overflow: hidden;
                display: flex;
                align-items: center;
                justify-content: center;
            }


            #kc-header, .login-pf-page-header, #kc-page-title {
                display: none !important;
            }


            #kc-container, #kc-container-wrapper, #kc-content, #kc-content-wrapper,
            .card-pf, .login-pf-body {
                background-color:rgba(0, 0, 0, 0.16) !important;
                background: transparent !important;
                box-shadow: none !important;
                border: none !important;
            }

            #kc-content, #kc-content-wrapper {
                background: transparent !important;
                box-shadow: none !important;
                border: none !important;
                width: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 16px;
            }

            #kc-form-login {

                background-color: rgba(40, 50, 60, 0.92) !important;
                border: 1px solid rgba(255, 255, 255, 0.15) !important;
                border-top: 4px solid #c5a059 !important;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6) !important;
                border-radius: 24px !important;
                backdrop-filter: blur(12px) !important;

                width: 100%;
                max-width: 550px;
                padding: 35px 50px;
                margin: 0 auto;
                display: flex;
                flex-direction: column;
                position: relative;
            }

            .logo-container {
                display: flex;
                justify-content: center;
                margin-bottom: 20px;
            }

            .logo-img {
                max-width: 140px;
                height: auto;
                filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5));
            }

            .hotel-title {
                text-align: center;
                color: #ffffff;
                font-size: 1.5rem;
                font-weight: 300;
                text-transform: uppercase;
                letter-spacing: 3px;
                margin-bottom: 25px;
                margin-top: 0;
                text-shadow: 0 2px 4px rgba(0,0,0,0.9);
            }

            .form-group {
                margin-bottom: 18px;
            }

            .form-group label {
                display: block;
                color: #ffffff;
                font-size: 0.85rem;
                font-weight: 600;
                margin-bottom: 6px;
                text-transform: uppercase;
                text-shadow: 0 1px 2px rgba(0,0,0,0.8);
                letter-spacing: 0.5px;
            }

            .form-group input {
                width: 100%;
                padding: 13px;
                font-size: 0.95rem;
                border-radius: 10px;
                border: 1px solid rgba(255, 255, 255, 0.25);
                background-color: rgba(0, 0, 0, 0.4);
                color: #ffffff;
                box-sizing: border-box;
                backdrop-filter: blur(6px);
                transition: all 0.3s ease;
            }

            .form-group input:focus {
                outline: none;
                background-color: rgba(0, 0, 0, 0.7);
                border-color: #c5a059;
                box-shadow: 0 0 12px rgba(197, 160, 89, 0.4);
            }

            .submit-button {
                width: 100%;
                padding: 14px;
                margin-top: 8px;
                background-color: #c5a059;
                color: #ffffff;
                font-size: 1rem;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                border: none;
                border-radius: 10px;
                cursor: pointer;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.4);
                transition: transform 0.2s, background-color 0.3s;
            }

            .submit-button:hover {
                background-color: #D49E35;
                color: rgb(0, 0, 0);
                transform: translateY(-1px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
            }

        </style>

        <form id="kc-form-login" onsubmit="login.disabled = true; return true;" action="${url.loginAction}" method="post">

            <div class="logo-container">
                <img src="${url.resourcesPath}/img/logoN.png" alt="Logo" class="logo-img" />
            </div>

            <h1 class="hotel-title">Hotel Management</h1>

            <div class="form-group">
                <label for="username">Usuario</label>
                <input id="username" name="username" type="text" autofocus autocomplete="off" />
            </div>

            <div class="form-group">
                <label for="password">Contraseña</label>
                <input id="password" name="password" type="password" autocomplete="off" />
            </div>

            <div class="form-group">
                <input class="submit-button" type="submit" value="Iniciar Sesión" />
            </div>

        </form>

    </#if>

</@layout.registrationLayout>
