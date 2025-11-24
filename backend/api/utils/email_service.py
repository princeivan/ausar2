import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

def send_via_sendgrid(subject, html_content, plain_text=None):
    if plain_text is None:
        plain_text = html_content  

    message = Mail(
        from_email="princeivan733@gmail.com",  
        to_emails="princeivan733@gmail.com",
        subject=subject,
        html_content=html_content,
        plain_text_content=plain_text
    )
    
    try:
        sg = SendGridAPIClient(os.environ.get("SENDGRID_API_KEY"))
        print("Using API Key:", os.environ.get("SENDGRID_API_KEY")[:5], "*****")  # partial key
        response = sg.send(message)
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {response.body}")
        print(f"Response Headers: {response.headers}")
        return True
    except Exception as e:
        print(f"SendGrid error: {str(e)}")
        return False