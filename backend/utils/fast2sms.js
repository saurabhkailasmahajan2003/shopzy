import axios from 'axios';

const FAST2SMS_API_KEY = '1wFebuyq627952JQjs2c1Q4hafm8Ss5yGkxY44jX9uJbHXVGkimYiLoEmy2q';
const FAST2SMS_URL = 'https://www.fast2sms.com/dev/bulkV2';

/**
 * Send OTP via Fast2SMS
 * @param {string} phoneNumber - Phone number (10 digits, without country code)
 * @param {string} otp - 6 digit OTP
 * @returns {Promise<Object>} - Response from Fast2SMS API
 */
export const sendOTP = async (phoneNumber, otp) => {
  try {
    // Format phone number (remove +91 or any country code, keep only 10 digits)
    let formattedPhone = phoneNumber.replace(/^\+91/, '').replace(/\D/g, '');
    
    if (formattedPhone.length !== 10) {
      throw new Error('Invalid phone number. Must be 10 digits.');
    }

    const message = `Your Shopzy OTP is ${otp}. Do not share this OTP with anyone. Valid for 5 minutes.`;

    const response = await axios.post(
      FAST2SMS_URL,
      {
        route: 'otp',
        variables_values: otp,
        numbers: formattedPhone,
      },
      {
        headers: {
          'authorization': FAST2SMS_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data && response.data.return === true) {
      return {
        success: true,
        message: 'OTP sent successfully',
        requestId: response.data.request_id,
      };
    } else {
      throw new Error(response.data?.message || 'Failed to send OTP');
    }
  } catch (error) {
    console.error('Fast2SMS Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || 'Failed to send OTP');
  }
};

/**
 * Send custom message via Fast2SMS
 * @param {string} phoneNumber - Phone number (10 digits)
 * @param {string} message - Message to send
 * @returns {Promise<Object>} - Response from Fast2SMS API
 */
export const sendSMS = async (phoneNumber, message) => {
  try {
    // Format phone number
    let formattedPhone = phoneNumber.replace(/^\+91/, '').replace(/\D/g, '');
    
    if (formattedPhone.length !== 10) {
      throw new Error('Invalid phone number. Must be 10 digits.');
    }

    const response = await fetch(FAST2SMS_URL, {
      method: 'POST',
      headers: {
        'authorization': FAST2SMS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'q',
        message: message,
        numbers: formattedPhone,
      }),
    });

    const data = await response.json();

    if (data && data.return === true) {
      return {
        success: true,
        message: 'SMS sent successfully',
        requestId: data.request_id,
      };
    } else {
      throw new Error(data?.message || 'Failed to send SMS');
    }
  } catch (error) {
    console.error('Fast2SMS Error:', error.message);
    throw new Error(error.message || 'Failed to send SMS');
  }
};

